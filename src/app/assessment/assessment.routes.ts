import { Route } from "@angular/router";
import { SelectCourseComponent } from "../subscriber/select-course/select-course.component";
export const ASSESSMENT_ROUTE: Route[] = [
  {
    path: "skill-rating/:jobRoleSlug",
    loadComponent: () => import('./wizard/wizard.component').then(c => c.WizardComponent),
  },
  //   {
  //     path: "take/:qcode",
  //     loadComponent: () => import('./take-quiz/take-quiz.component').then(c => c.TakeQuizComponent),
  //   },
  { path: '**', component: SelectCourseComponent }
];