import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private authService: AuthService,
    private httpService: HttpService,
  ) {}

  generateInitialAssessment(): Observable<any> {
    const api_key = this.authService.currentUserValue?.token ?? '';
    const url = 'apis/users/initial-assessment';
    return this.httpService.postData(url, {}, api_key).pipe(
      map((response: any) => response?.data),
    );
  }
}
