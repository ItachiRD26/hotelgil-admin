import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'rooms',
        loadComponent: () => import('./pages/tabs/rooms/rooms.page').then(m => m.RoomsPage),
      },
      {
        path: 'revenue',
        loadComponent: () => import('./pages/tabs/revenue/revenue.page').then(m => m.RevenuePage),
      },
      {
        path: '',
        redirectTo: 'rooms',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];