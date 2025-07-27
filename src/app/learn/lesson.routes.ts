import { Route } from "@angular/router";
export const LESSON_ROUTE: Route[] = [
  {
    path: "overview/:qcode",
    loadComponent: () => import('./lesson/lesson.page').then(c => c.LessonPage),
  },
  {
    path: "topic/:qcode",
    loadComponent: () => import('./lesson/lesson.page').then(c => c.LessonPage),
  }
];