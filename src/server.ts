import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { content } from '../content';
import { writeSourceTypes } from 'comark-content/build';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();
const contentClients = new Set<import('node:http').ServerResponse>();
let typeGeneration = Promise.resolve();

const regenerateTypes = () => {
  typeGeneration = typeGeneration
    .then(async () => {
      await writeSourceTypes(content);
    })
    .catch((error: unknown) => {
      console.error('[content] failed to generate types', error);
    });
};

const notifyContentClients = () => {
  for (const client of contentClients) {
    client.write('data: {}\n\n');
  }
};

content.hooks.hook('watch:file:update', notifyContentClients);
content.hooks.hook('watch:file:remove', notifyContentClients);
content.hooks.hook('watch:file:update', regenerateTypes);
content.hooks.hook('watch:file:remove', regenerateTypes);

void content
  .init()
  .then(() => writeSourceTypes(content))
  .then(() => content.watch())
  .catch((error: unknown) => {
    console.error('[content] failed to initialize', error);
  });

app.get('/__content_hmr', (_req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write('retry: 1000\n\n');
  contentClients.add(res);
  res.on('close', () => contentClients.delete(res));
});

app.use('/api/content', async (req, res, next) => {
  try {
    const response = await content.handler(
      new Request(`http://${req.headers.host ?? 'localhost'}${req.originalUrl}`),
    );
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    next(error);
  }
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
