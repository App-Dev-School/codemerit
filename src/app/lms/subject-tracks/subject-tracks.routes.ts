import { Route } from '@angular/router';
import { Page404Component } from '../../authentication/page404/page404.component';
import { SubjectTracksComponent } from './manage/subject-tracks.component';

export const SUBJECT_TRACKS_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: SubjectTracksComponent,
  },
  { path: '**', component: Page404Component },
];
