import { Route } from '@angular/router';
import { Page404Component } from '../../authentication/page404/page404.component';
import { MyQuizListComponent } from './myQuizzes/my-quiz-list.component';

export const QUIZZES_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: MyQuizListComponent,
  },
  { path: '**', component: Page404Component },
];
