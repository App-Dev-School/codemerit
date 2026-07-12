import { Route } from '@angular/router';
export const LMS_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((m) => m.LMS_DASHBOARD_ROUTE),
  },
  {
    path: 'topics',
    loadChildren: () =>
      import('./topics/topics.routes').then((m) => m.TOPICS_ROUTE),
  },
  {
    path: 'questions',
    loadChildren: () =>
      import('./questions/questions.routes').then((m) => m.QUESTIONS_ROUTE),
  },
  {
    path: 'quizzes',
    loadChildren: () =>
      import('./quizzes/quizzes.routes').then((m) => m.QUIZZES_ROUTE),
  },
  {
    path: 'lessons',
    loadChildren: () =>
      import('./lessons/lessons.routes').then((m) => m.LESSONS_ROUTE),
  },
  {
    path: 'subject-tracks',
    loadChildren: () =>
      import('./subject-tracks/subject-tracks.routes').then((m) => m.SUBJECT_TRACKS_ROUTE),
  },
  {
    path: 'certification-tracks',
    loadChildren: () =>
      import('./certification-tracks/certification-tracks.routes').then((m) => m.CERTIFICATION_TRACKS_ROUTE),
  },
];
