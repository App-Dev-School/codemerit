import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, throwError } from 'rxjs';
//import { User } from '../models/user';
import { Role } from '@core/models/role';
import { Router } from '@angular/router';
import { AuthConstants } from '@config/AuthConstants';
import { HttpService } from './http.service';
import { environment } from 'src/environments/environment';
import { User } from '@core/models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  private users = [
    {
      id: 1,
      userImage: 'assets/images/users/user.jpg',
      username: 'admin@codemerit.com',
      email: 'admin@codemerit.com',
      password: 'user@1234',
      firstName: 'Eckhart',
      lastName: 'Tollee',
      role: Role.Subscriber,
      token: 'admin-token',
      accountStatus: 'Active',
      createdAt: ''
    },
    {
      id: 2,
      userImage: 'assets/images/users/user.jpg',
      username: 'user1@codemerit.com',
      email: 'user@codemerit.in',
      password: 'user@123',
      firstName: 'Vinay',
      lastName: 'Shaswat',
      role: Role.Subscriber,
      token: 'user-token',
      accountStatus: 'Active',
      createdAt: ''
    }
  ];

  constructor(private httpService: HttpService, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(postData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const url = 'auth/login';
    return this.httpService.post(url, postData, httpOptions).pipe(map((user: any) => {
      //store user details and jwt token in local storage to keep user logged in between page refreshes
      if (user.data) {
        this.setLocalData(user.data);
        //this.currentUserSubject.next(user.data);
      }
      console.log("LoginResponse" , user, JSON.stringify(user.data));
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

   verifyAccount(postData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    const url = 'auth/verify';
    return this.httpService.post(url, postData, httpOptions);
  }
  
  setLocalData(userData: any) {
    //talk to storage service
    if (userData && userData.id > 0) {
      localStorage.setItem(AuthConstants.AUTH, JSON.stringify(userData));
      this.currentUserSubject.next(userData);
    }
  }

  logout(debug="") {
    console.log("CodeMeritApp Log out =>", debug);
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
    this.router.navigate(["/authentication/page404"]);
  }

  redirectToLogin() {
    this.router.navigate(["/authentication/signin"]);
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

  getFullProfile(user_name: any, api_key: any): Observable<any> {
    const url = 'apis/users/profile/' + user_name;
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + " via Token " + api_key);
    }
    return this.httpService.get(url, api_key);
  }

  updateUserAccount(api_key: any, user_name: any, postData: any): Observable<any> {
    const url = 'apis/users/update?userId='+user_name;
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + JSON.stringify(postData) + " via Token " + api_key);
    }
    return this.httpService.put(url, postData, api_key);
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
    const api_key = this.currentUserValue.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': api_key
      })
    };
    const url = 'apis/summary';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + JSON.stringify(postData) + " via Token " + api_key);
    }
    return this.httpService.post(url, JSON.stringify(postData), httpOptions);
  }

  getAllUsers(): Observable<any> {
    const api_key = this.currentUserValue.token;
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json',
    //     'Authorization': api_key
    //   })
    // };
    const url = 'apis/users';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " via Token " + api_key);
    }
    return this.httpService.get(url, api_key);
  }

   getFilteredUsers(postData: any): Observable<any> {
    const api_key = this.currentUserValue.token;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': api_key
      })
    };
    const url = 'apis/users';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + JSON.stringify(postData) + " via Token " + api_key);
    }
    return this.httpService.post(url, JSON.stringify(postData), httpOptions);
  }

  connectToInternet() {
    throw new Error("Method not implemented.");
  }

  log(...msg) {
    console.log("APPDEBUG", msg);
  }

}
