import { Route } from '@angular/router';
import { Page404Component } from '../../authentication/page404/page404.component';
import { StandardQuizListComponent } from './list/standard-quiz-list.component';
import { MyQuizListComponent } from './myQuizzes/my-quiz-list.component';

export const QUIZZES_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'myQuizzes',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: StandardQuizListComponent,
  },
  {
    path: 'myQuizzes',
    component: MyQuizListComponent,
  },
  { path: '**', component: Page404Component },
];
