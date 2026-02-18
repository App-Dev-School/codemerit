import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService } from '@core';
import { HttpService } from '@core/service/http.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { permissionsItem } from './permission-item.model';

@Injectable({
  providedIn: 'root',
})
export class permissionsService {
  private readonly API_URL = 'assets/data/permissions.json';
  dataChange: BehaviorSubject<permissionsItem[]> = new BehaviorSubject<permissionsItem[]>([]);

  constructor(private authService: AuthService, private httpService: HttpService, private httpClient: HttpClient) { }

  getDummyPermissions(): Observable<permissionsItem[]> {
    return this.httpClient
      .get<permissionsItem[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

        getAllPermissions(): Observable<permissionsItem[]> {
          let api_key = '';

          if (this.authService.currentUserValue?.token) {
            api_key = this.authService.currentUserValue.token;
          }

          const url = 'apis/userPermissions';

          return this.httpService.get(url, api_key).pipe(
            map((response: any) => response.data)
          );
        }

  addpermissions(item: any): Observable<any> {
    let api_key = '';
    if (this.authService.currentUserValue && this.authService.currentUserValue.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': api_key
      })
    };
    const url = 'apis/permissions/create';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + JSON.stringify(item) + " via Token " + api_key);
    }
    return this.httpService.postWithParams(url, item, httpOptions).pipe(
      map((response) => {
        return response; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  updatepermissions(permissions: any, topicId: any): Observable<any> {
    let api_key = '';
    if (this.authService.currentUserValue && this.authService.currentUserValue.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': api_key
      })
    };
    const url = 'apis/permissions/update/' + topicId;
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + JSON.stringify(permissions) + " via Token " + api_key);
    }
    return this.httpService.put(url, permissions, api_key).pipe(
      map((response) => {
        return response; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  deletepermissions(id: number): Observable<number> {
    let api_key = '';
    if (this.authService.currentUserValue && this.authService.currentUserValue.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/permissions/delete/' + id;
    return this.httpService.delete(url, api_key).pipe(
      map((response) => {
        if (AuthConstants.DEV_MODE) {
          console.log("Hiting ", response);
        }
        return id;
      }),
      catchError(this.handleError)
    );;
  }

  /** Handle Http operation that failed */
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }
}
