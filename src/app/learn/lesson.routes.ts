import { Route } from "@angular/router";
export const LESSON_ROUTE: Route[] = [
  {
    path: 'create-lesson',
    loadComponent: () => import('./create-lesson/create-lesson.component').then(c => c.CreateLessonComponent),
  }
];
