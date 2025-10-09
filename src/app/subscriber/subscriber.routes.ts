import { Route } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SelectSubjectComponent } from './select-subject/select-subject.component';
import { CourseDashboardComponent } from './course-dashboard/course-dashboard.component';
import { SelectCourseComponent } from './select-course/select-course.component';
export const SUBSCRIBER_ROUTE: Route[] = [
  {
    path: 'start/:course',
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
  { path: '**', component: SelectCourseComponent }
];

