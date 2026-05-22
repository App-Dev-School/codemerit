import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../service/auth.service';
import { AuthConstants } from '@config/AuthConstants';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (
      this.authService.currentUserValue?.id &&
      this.authService.currentUserValue?.token
    ) {
      const userRole = this.authService.currentUserValue.role;
      if (route.data['role'] && route.data['role'].indexOf(userRole) === -1) {
        console.log("Codemerit AuthGuard :: ", userRole, "Not Allowed", this.router.url);
        this.router.navigate(['/authentication/signin']);
        return false;
      }
      return true;
    }

    localStorage.setItem(
      AuthConstants.REDIRECT_URL,
      state.url,
    );

    this.router.navigate(
      ['/authentication/signin'],
      {
        queryParams: {
          redirectUrl:
            state.url,
        },
      },
    );
    return false;
  }
}
