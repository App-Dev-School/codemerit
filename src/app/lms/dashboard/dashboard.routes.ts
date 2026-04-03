import { Route } from '@angular/router';
import { Page404Component } from '../../authentication/page404/page404.component';
import { LmsDashboardMainComponent } from './main/main.component';

export const LMS_DASHBOARD_ROUTE: Route[] = [
  {
    path: '',
    component: LmsDashboardMainComponent,
  },
  {
    path: 'main',
    redirectTo: '',
    pathMatch: 'full',
  },
  { path: '**', component: Page404Component },
];
