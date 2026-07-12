import { Route } from '@angular/router';
import { Page404Component } from '../../authentication/page404/page404.component';
import { CertificationTracksComponent } from './manage/certification-tracks.component';

export const CERTIFICATION_TRACKS_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: CertificationTracksComponent,
  },
  { path: '**', component: Page404Component },
];
