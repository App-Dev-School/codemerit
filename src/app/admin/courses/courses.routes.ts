import { Route } from '@angular/router';
import { Page404Component } from '../../authentication/page404/page404.component';
import { CoursesComponent } from './manage/courses.component';
export const COURSE_ROUTE: Route[] = [
  {
    path: 'list',
    component: CoursesComponent,
  },
  // {
  //   path: 'skill-profile',
  //   component: SkillProfileComponent,
  // },
  { path: '**', component: Page404Component },
];
