import { Route } from "@angular/router";
import { SelectCourseComponent } from "../subscriber/select-course/select-course.component";
export const ASSESSMENT_ROUTE: Route[] = [
  {
    path: "skill-rating/:jobRoleSlug",
    loadComponent: () => import('./wizard/wizard.component').then(c => c.WizardComponent),
  },
  {
    path: "subject-assessment/:subject",
    loadComponent: () => import('./subject-assessment/subject-assessment.component').then(c => c.SubjectAssessmentComponent),
  },
  { path: '**', component: SelectCourseComponent }
];