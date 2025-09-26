import { Route } from '@angular/router';
import { Page404Component } from '../../authentication/page404/page404.component';
import { TopicsComponent } from './manage/topics.component';
export const TOPICS_ROUTE: Route[] = [
  {
    path: 'list',
    component: TopicsComponent,
  },
  { path: '**', component: Page404Component },
];
