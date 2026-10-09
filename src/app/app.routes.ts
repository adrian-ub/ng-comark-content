import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home.page').then(({ HomePage }) => HomePage),
  },
  {
    path: 'posts/:id',
    loadComponent: () =>
      import('./pages/post.page').then(({ PostPage }) => PostPage),
  },
  { path: '**', redirectTo: '' },
];
