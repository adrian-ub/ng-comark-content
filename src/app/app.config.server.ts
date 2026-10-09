import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { ContentService } from './content';
import { ContentServerService } from './content.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: ContentService,
      useClass: ContentServerService
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
