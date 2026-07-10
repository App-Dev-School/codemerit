import { Route } from '@angular/router';
import { CourseDashboardComponent } from './course-dashboard/course-dashboard.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SelectCourseComponent } from './select-course/select-course.component';
export const SUBSCRIBER_ROUTE: Route[] = [
  {
    path: '',
    component: CourseDashboardComponent,
  },
  {
    path: "learn/:subject",
    component: DashboardComponent,
  },
  // {
  //   path: 'select-subject',
  //   component: SelectSubjectComponent,
  // },
  // {
  //   path: 'select-job-role',
  //   component: SelectCourseComponent,
  // },
  //{ path: '**', component: SelectSubjectComponent }
  //
  {
    path: ':course',
    component: CourseDashboardComponent,
  },
  { path: '**', component: SelectCourseComponent }
];

