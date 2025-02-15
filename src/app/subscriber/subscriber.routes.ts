import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Page404Component } from '../authentication/page404/page404.component';
import { SelectSubjectComponent } from './select-subject/select-subject.component';
export const SUBSCRIBER_ROUTE: Route[] = [
  // {
  //   path: 'learning',
  //   component: DashboardComponent,
  // },
  {
    path: "learn/:subject",
    component: DashboardComponent,
  },
  {
    path: 'select-subject',
    component: SelectSubjectComponent,
  },
  { path: '**', component: SelectSubjectComponent }
];

