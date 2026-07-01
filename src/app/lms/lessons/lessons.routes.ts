import { Route } from '@angular/router';
import { Page404Component } from '../../authentication/page404/page404.component';
import { ManageLessonsComponent } from './manage-lessons/manage-lessons.component';

export const LESSONS_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: ManageLessonsComponent,
  },
  {
    path: 'create-lesson',
    loadComponent: () => import('./create-lesson/create-lesson.component').then(c => c.CreateLessonComponent),
  },
  { path: '**', component: Page404Component },
];
