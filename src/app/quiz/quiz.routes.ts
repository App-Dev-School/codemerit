import { Route } from "@angular/router";
export const QUIZ_ROUTE: Route[] = [
  {
    path: "builder",
    loadComponent: () => import('./quiz-builder/quiz-builder.component').then(c => c.QuizBuilderComponent),
  },
  {
    path: "take/:qcode",
    loadComponent: () => import('./take-quiz/take-quiz.component').then(c => c.TakeQuizComponent),
  },
  {
    path: "result/:qcode",
    loadComponent: () => import('./view-result/view-result.component').then(c => c.ViewResultComponent),
  }
];