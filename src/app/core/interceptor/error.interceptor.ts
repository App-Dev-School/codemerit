import { AuthService } from "../service/auth.service";
import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthService) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        // Only force a logout+reload if the user actually had a session — a 401 on a
        // request that never carried a token (anonymous visitor on a public page) isn't
        // an expired session, and reloading just repeats the same request forever.
        if (err.status === 401 && this.authenticationService.currentUserValue?.token) {
          // auto logout if 401 response returned from api
          this.authenticationService.logout("Interceptor");
          location.reload();
        }

        const error = err.error.message || err.statusText;
        return throwError(error);
      })
    );
  }
}
