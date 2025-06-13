import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'product-create',
    loadComponent: () => import('./pages/product-create/product-create.page').then( m => m.ProductCreatePage)
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
