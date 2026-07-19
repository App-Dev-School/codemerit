import { Route } from "@angular/router";
export const ASSESSMENT_ROUTE: Route[] = [
  {
    path: "skill-rating/?:jobRoleSlug",
    loadComponent: () => import('./wizard/wizard.component').then(c => c.WizardComponent),
  },
  {
    path: "subject-assessment/:subject",
    loadComponent: () => import('./subject-assessment/subject-assessment.component').then(c => c.SubjectAssessmentComponent),
  },
  {
    path: "report/:assessmentId",
    loadComponent: () => import('./report/assessment-report.component').then(c => c.AssessmentReportComponent),
  },
  //{ path: '**', component: SelectCourseComponent }
];