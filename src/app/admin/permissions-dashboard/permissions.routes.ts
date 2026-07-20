import { Route } from '@angular/router';
import { Page404Component } from '../../authentication/page404/page404.component';
import { permissionsComponent } from './manage/permissions.component';
import { PermissionRequestsComponent } from './requests/requests.component';
export const PERMISSIONS_ROUTE: Route[] = [
  {
    path: 'list',
    component: permissionsComponent,
  },
  {
    path: 'requests',
    component: PermissionRequestsComponent,
  },
  { path: '**', component: Page404Component },
];
