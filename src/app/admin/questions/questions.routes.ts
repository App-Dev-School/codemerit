import { Route } from '@angular/router';
import { Page404Component } from '../../authentication/page404/page404.component';
import { QuestionsComponent } from './manage/questions.component';
import { QuestionFormPage } from './question-form/question-form.component';
import { QuestionViewerComponent } from './question-viewer/question-viewer.component';
export const QUESTIONS_ROUTE: Route[] = [
  {
    path: 'list',
    component: QuestionsComponent,
  },
  {
    path: 'viewer',
    component: QuestionViewerComponent,
  },
  {
    path: 'create',
    component: QuestionFormPage
  },
  {
    path: 'update/:question-slug',
    component: QuestionFormPage
  },
  { path: '**', component: Page404Component },
];
