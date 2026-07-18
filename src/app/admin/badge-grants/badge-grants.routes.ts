import { Route } from '@angular/router';
import { Page404Component } from '../../authentication/page404/page404.component';
import { ManageBadgeGrantsComponent } from './manage/badge-grants.component';

export const BADGE_GRANTS_ROUTE: Route[] = [
  {
    path: 'grant',
    component: ManageBadgeGrantsComponent,
  },
  { path: '**', component: Page404Component },
];
