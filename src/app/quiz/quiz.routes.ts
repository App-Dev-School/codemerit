import { Route } from "@angular/router";
export const QUIZ_ROUTE: Route[] = [
  {
    path: "take/:qcode",
    loadComponent: () => import('./take-quiz/take-quiz.component').then(c => c.TakeQuizComponent),
  },
  {
    path: "result/:qcode",
    loadComponent: () => import('./view-result/view-result.component').then(c => c.ViewResultComponent),
  },
  // {
  //   path: "result/:qcode",
  //   loadComponent: () => import('@shared/components/quiz-result/quiz-result.component').then(c => c.QuizResultComponent),
  // }
];