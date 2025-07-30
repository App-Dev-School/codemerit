import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, throwError } from 'rxjs';
//import { User } from '../models/user';
import { Role } from '@core/models/role';
import { Router } from '@angular/router';
import { AuthConstants } from '@config/AuthConstants';
import { HttpService } from './http.service';
import { AppUser } from '@core/models/appuser';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<AppUser>;
  public currentUser: Observable<AppUser>;

  private users = [
    {
      id: 1,
      userImage: 'assets/images/users/user.jpg',
      username: 'admin@codemerit.in',
      email: 'admin@codemerit.in',
      password: 'user@123',
      firstName: 'Eckhart',
      lastName: 'Tollee',
      role: Role.Admin,
      token: 'admin-token',
      status: 'Active'
    },
    {
      id: 2,
      userImage: 'assets/images/users/user.jpg',
      username: 'user@codemerit.in',
      email: 'user@codemerit.in',
      password: 'user@123',
      firstName: 'Vinay',
      lastName: 'Shaswat',
      role: Role.Subscriber,
      token: 'user-token',
      status: 'Active'
    }
  ];

  constructor(private httpService: HttpService, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<AppUser>(
      JSON.parse(localStorage.getItem('currentUser') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): AppUser {
    return this.currentUserSubject.value;
  }

  login(postData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const url = 'login_controller';
    if (AuthConstants.DEV_MODE) {
      console.log("/******  Hitting Login API : " + url + " with Params => " + JSON.stringify(postData));
    }
    return this.httpService.post(url, postData, httpOptions).pipe(map((user: any) => {
      //store user details and jwt token in local storage to keep user logged in between page refreshes
      if (user.userData) {
        this.setLocalData(user.userData);
        //this.currentUserSubject.next(user.userData);
      }
      if (user.myProfile) {
        localStorage.setItem(AuthConstants.CACHE_FULL_PROFILE, JSON.stringify(user.myProfile));
      }
      return user;
    }));

    //return this.httpService.post(url, postData, httpOptions);
  }

  register(postData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const url = 'auth/register';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + JSON.stringify(postData));
    }
    //return this.http.post<any>(url, postData, httpOptions);
    return this.httpService.postWithParams(url, postData, httpOptions);
  }
  
  setLocalData(userData: any) {
    //talk to storage service
    if (userData && userData.id > 0) {
      localStorage.setItem(AuthConstants.AUTH, JSON.stringify(userData));
      this.currentUserSubject.next(userData);
    }
  }

  logout(debug="") {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(this.currentUserValue);
    return of({ success: false });
  }

  hitSendNotification(api_key: any, postData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': api_key
      })
    };
    const url = 'apis/push_notifications/send';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + JSON.stringify(postData) + " via Token " + api_key);
    }
    return this.httpService.post(url, postData, httpOptions);
  }

  redirectToErrorPage() {
    this.router.navigate(["/404"]);
  }
  redirectToBrowsePage() {
    this.router.navigate(["/app/browse"]);
  }

  redirectToSubscriptionPlans() {
    this.router.navigate(["/app/plans"]);
  }

  redirectToUserDashboard() {
    this.router.navigate(["/account/dashboard"]);
  }

  redirectToDashboard() {
    if(this.currentUserValue.role == Role.Admin){
      this.router.navigate(["/account/dashboard"]);
    }else{
      this.router.navigate(["/account/dashboard"]);
    }
  }

  redirectToSupportCenter() {
    this.router.navigate(["/bazichic/consultation/enquiry"]);
  }

  //

  getFullProfile(api_key: any, user_name: any): Observable<any> {
    const url = 'profile/' + user_name;
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + " via Token " + api_key);
    }
    return this.httpService.get(url, api_key);
  }

  updateUserAccount(api_key: any, postData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        //'Content-Type':  'application/json',
        'Authorization': api_key
      })
    };
    const url = environment.apiUrl + 'users/update';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + JSON.stringify(postData) + " via Token " + api_key);
    }
    return this.httpService.post(url, postData, httpOptions);
    //return this.http.post<any>(url, postData, httpOptions);
  }

  changeUserPassword(api_key: any, postData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': api_key
      })
    };
    const url = environment.apiUrl + 'users/creds/update';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + JSON.stringify(postData) + " via Token " + api_key);
    }
    return this.httpService.post(url, postData, httpOptions);
  }

  getAdminDashData(postData: any): Observable<any> {
    const api_key = this.currentUserValue.api_key;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': api_key
      })
    };
    const url = environment.apiUrl + 'apis/summary';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + JSON.stringify(postData) + " via Token " + api_key);
    }
    return this.httpService.post(url, JSON.stringify(postData), httpOptions);
  }

  connectToInternet() {
    throw new Error("Method not implemented.");
  }

  loginDummy(username: string, password: string) {
    const user = this.users.find((u) => u.username === username && u.password === password);
    if (!user) {
      return this.error('Username or password is incorrect');
    } else {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return this.ok({
        id: user.id,
        userImage: user.userImage,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token: user.token,
        status: user.status
      });
    }
  }
  ok(body?: {
    id: number;
    userImage: string;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    token: string;
    status: string;
  }) {
    return of(new HttpResponse({ status: 200, body }));
  }
  error(message: string) {
    return throwError(message);
  }

}
