import { Route } from '@angular/router';
export const ADMIN_ROUTE: Route[] = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTE),
  },
  {
    path: 'permissions',
    loadChildren: () =>
      import('./permissions-dashboard/permissions.routes').then((m) => m.PERMISSIONS_ROUTE),
  },
  {
    path: 'badges',
    loadChildren: () =>
      import('./badge-grants/badge-grants.routes').then((m) => m.BADGE_GRANTS_ROUTE),
  }
];
