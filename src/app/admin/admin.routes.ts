import { Route } from '@angular/router';
export const ADMIN_ROUTE: Route[] = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTE),
  },
  {
    path: 'topics',
    loadChildren: () =>
      import('./topics/topics.routes').then((m) => m.TOPICS_ROUTE),
  },
  {
    path: 'permissions',
    loadChildren: () =>
      import('./permissions-dashboard/permissions.routes').then((m) => m.PERMISSIONS_ROUTE),
  },
  {
    path: 'questions',
    loadChildren: () =>
      import('./questions/questions.routes').then((m) => m.QUESTIONS_ROUTE),
  }
];
