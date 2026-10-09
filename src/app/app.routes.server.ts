import { RenderMode, ServerRoute } from '@angular/ssr';
import { content } from '../../content';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'posts/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      (await content.list())
        .filter((post) => post.path.startsWith('/posts/'))
        .map((post) => ({ id: post.meta.stem.split('/').pop() ?? '' })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
