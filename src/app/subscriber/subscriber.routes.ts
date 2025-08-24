import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SelectSubjectComponent } from './select-subject/select-subject.component';
import { CourseDashboardComponent } from './course-dashboard/course-dashboard.component';
export const SUBSCRIBER_ROUTE: Route[] = [
  {
    path: 'start',
    component: CourseDashboardComponent,
  },
  {
    path: "learn/:subject",
    component: DashboardComponent,
  },
  {
    path: 'select-subject',
    component: SelectSubjectComponent,
  },
  //{ path: '**', component: SelectSubjectComponent }
  //
  { path: '**', component: CourseDashboardComponent }
];

