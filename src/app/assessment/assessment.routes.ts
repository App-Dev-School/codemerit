import { Route } from "@angular/router";
export const ASSESSMENT_ROUTE: Route[] = [
  {
    path: "skill-rating/:jobRoleSlug",
    loadComponent: () => import('./wizard/wizard.component').then(c => c.WizardComponent),
  },
//   {
//     path: "take/:qcode",
//     loadComponent: () => import('./take-quiz/take-quiz.component').then(c => c.TakeQuizComponent),
//   },
//   {
//     path: "result/:qcode",
//     loadComponent: () => import('./view-result/view-result.component').then(c => c.ViewResultComponent),
//   }
];