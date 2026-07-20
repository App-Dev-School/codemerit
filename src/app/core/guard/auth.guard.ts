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
      const requiredRoles = route.data['role'];
      const requiredPermission: string | undefined = route.data['permission'];
      const roleOk = !requiredRoles || requiredRoles.indexOf(userRole) !== -1;
      // A route can declare `permission` alongside `role` to let a permission
      // holder in even without the listed role (e.g. Role:TalentPartner
      // reaching an Admin-only route) — either satisfies access.
      const permissionOk = !!requiredPermission && this.authService.hasPermission(requiredPermission);

      if (requiredRoles && !roleOk && !permissionOk) {
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
    console.log("REDIRECT_URL saved:", state.url);
    this.router.navigate(['/authentication/signin']);
    return false;
  }
}
