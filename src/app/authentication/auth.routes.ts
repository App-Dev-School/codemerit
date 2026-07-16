import { Route } from "@angular/router";
import { SigninComponent } from "./signin/signin.component";
import { SignupComponent } from "./signup/signup.component";
import { RegisterComponent } from "./register/register.component";
import { SocialCallbackComponent } from "./social-callback/social-callback.component";
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { VerifyAccountComponent } from "./locked/locked.component";
import { Page404Component } from "./page404/page404.component";
import { Page500Component } from "./page500/page500.component";
export const AUTH_ROUTE: Route[] = [
  {
    path: "",
    redirectTo: "signin",
    pathMatch: "full",
  },
  {
    path: "signin",
    component: SigninComponent,
  },
  {
    path: "signup",
    component: SignupComponent,
  },
  {
    path: "register",
    component: RegisterComponent,
  },
  {
    path: "social-callback",
    component: SocialCallbackComponent,
  },
  {
    path: "social-failed",
    component: Page500Component,
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
  },
  {
    path: "verify",
    component: VerifyAccountComponent,
  },
  {
    path: "page404",
    component: Page404Component,
  },
  {
    path: "page500",
    component: Page500Component,
  },
];
