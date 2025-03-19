import { Route } from "@angular/router";
import { MainLayoutComponent } from "../layout/app-layout/main-layout/main-layout.component";
export const QUIZ_ROUTE: Route[] = [
  {
    path: "take/:qcode",
    loadComponent: () => import('./take-quiz/take-quiz.component').then(c => c.TakeQuizComponent),
  },
  {
    path: "start/:qcode",
    loadComponent: () => import('./question/question.page').then(c => c.QuestionPage),
  }
];