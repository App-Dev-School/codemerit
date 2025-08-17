import { Route } from '@angular/router';
import { Page404Component } from '../../authentication/page404/page404.component';
import { QuestionsComponent } from './manage/questions.component';
export const QUESTIONS_ROUTE: Route[] = [
  {
    path: 'list',
    component: QuestionsComponent,
  },
  { path: '**', component: Page404Component },
];
