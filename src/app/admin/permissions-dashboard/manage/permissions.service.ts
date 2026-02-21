import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService } from '@core';
import { Permission, UserPermissionItem } from '@core/models/permission.model';
import { HttpService } from '@core/service/http.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class permissionsService {

  private readonly API_URL = 'assets/data/permissions.json';
  dataChange: BehaviorSubject<UserPermissionItem[]> = new BehaviorSubject<UserPermissionItem[]>([]);
  masterPermissions: Permission[];

  constructor(private authService: AuthService, private httpService: HttpService, private httpClient: HttpClient) { }

  getDummyPermissions(): Observable<UserPermissionItem[]> {
    return this.httpClient
      .get<UserPermissionItem[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  setPermissions(data: Permission[]) {
    this.masterPermissions = data;
  }

  getSavedMasterPermissions(): Permission[] {
    return this.masterPermissions;
  }


  getAllPermissions(): Observable<Permission[]> {
    const url = 'apis/permissions/master-permissions';
    return this.httpService.getWithoutAuth(url).pipe(
      map((response: any) => response.data)
    );
  }

  getAllUserPermissions(): Observable<UserPermissionItem[]> {
    let api_key = '';
    if (this.authService.currentUserValue?.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/permissions/user-permissions';
    return this.httpService.get(url, api_key).pipe(
      map((response: any) => response.data)
    );
  }

  getAllUsers(): Observable<any[]> {
    let api_key = '';

    if (this.authService.currentUserValue?.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/users';
    return this.httpService.get(url, api_key).pipe(
      map((response: any) => response.data)
    );
  }

  addPermissions(item: any): Observable<any> {
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
    const url = 'apis/permissions/grant';
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

  updatePermissions(permissions: any, itemId: any): Observable<any> {
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
    const url = 'apis/permissions/update/' + itemId;
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

  revokePermissions(id: number): Observable<number> {
    let api_key = '';
    if (this.authService.currentUserValue && this.authService.currentUserValue.token) {
      api_key = this.authService.currentUserValue.token;
    }
    //const url = 'apis/permissions/revoke/' + id;
    const url = `apis/permissions/revoke?id=${id}`;
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
