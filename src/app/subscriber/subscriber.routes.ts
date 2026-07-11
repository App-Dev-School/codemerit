import { Route } from '@angular/router';
import { LearningDashboardComponent } from './learning-dashboard/learning-dashboard.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SelectCourseComponent } from './select-course/select-course.component';
export const SUBSCRIBER_ROUTE: Route[] = [
  {
    path: '',
    component: LearningDashboardComponent,
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
  // {
  //   path: ':course',
  //   component: LearningDashboardComponent,
  // },
  //{ path: '**', component: SelectCourseComponent }
];

