import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthConstants } from 'src/app/config/AuthConstants';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';
import { Country } from '@core/models/country.data';
import { Subject } from '@core/models/subject';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  constructor(private router: Router, private httpService: HttpService,
    public authService: AuthService) { }

  getHomeData(): Observable<any> {
    const url = 'apis/codemerit/home';
    return this.httpService.getWithoutAuth(url);
  }

  getDocTypes(): Observable<any> {
    const api_key = this.authService.currentUserValue?.token;
    const url = 'get/document_types';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with =>  via Token " + api_key);
    }
    return this.httpService.get(url, api_key);
  }

  getSubscriptionPlans(): Observable<any> {
    const api_key = this.authService.currentUserValue?.token;
    const url = 'apis/subscription_plans';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with =>  via Token " + api_key);
    }
    return this.httpService.get(url, api_key);
  }

  getStatesFromServer(): Observable<any> {
    const api_key = this.authService.currentUserValue?.token;
    const url = 'get/states';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " via Token " + api_key);
    }
    return this.httpService.get(url, api_key).pipe(
      map((user: any) => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        if (user.data) {
          if (AuthConstants.DEV_MODE) {
            console.log("/************ Fetched States from Server and stored locally => " + JSON.stringify(user.data));
          }
          localStorage.setItem(AuthConstants.STATES, JSON.stringify(user.data));
          //localStorage.setItem(AuthConstants.STATES, user.data);
        }
        return user.data;
      })
    );
  }

  getStates(): Observable<any> {
    if (AuthConstants.DEV_MODE) {
      console.log("getStates() called => ");
    }
    if (localStorage.getItem(AuthConstants.STATES) === null) {
      let datum = JSON.parse(localStorage.getItem(AuthConstants.STATES));
      if (AuthConstants.DEV_MODE) {
        console.log("getStates() => Fetched States From LocalStorage => " + JSON.stringify(datum));
      }
      if (datum == null || datum == undefined) {
        if (AuthConstants.DEV_MODE) {
          console.log("getStates() => Null Local data. Requesting Server => ");
        }
        return this.getStatesFromServer();
      }
      return of(datum);
    } else {
      if (AuthConstants.DEV_MODE) {
        console.log("getStates() => Hiting Server for States Data => ");
      }
      return this.getStatesFromServer();
    }
    //return this.getStatesFromServer();
  }

  getCategories(): Observable<any> {
    const api_key = this.authService.currentUserValue?.token;
    const url = 'apis/categories/list';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " via Token " + api_key);
    }
    return this.httpService.get(url, api_key).pipe(
      map((user: any) => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        if (user.data) {
          if (AuthConstants.DEV_MODE) {
            console.log("/************ Fetched Categories from Server and stored locally => " + JSON.stringify(user.data));
          }
          localStorage.setItem(AuthConstants.CATEGORIES, JSON.stringify(user.data));
        }
        return user.data;
      })
    );
  }

  getLastFewNotifications(): Observable<any> {
    const api_key = this.authService.currentUserValue?.token;
    const url = 'apis/notifications/latest';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " via Token " + api_key);
    }
    return this.httpService.get(url, api_key).pipe(
      map((user: any) => {
        if (AuthConstants.DEV_MODE) {
          console.log("Last Few Notifications => " + JSON.stringify(user));
        }
        if (user.data) {
          localStorage.setItem(AuthConstants.CATEGORIES, JSON.stringify(user.data));
        }
        return user.data;
      })
    );
  }


  /*****/
  getMockMySubjectsData(): Observable<any> {
    return this.httpService.getLocalMock('assets/data/my-subjects.json');
    //return this.http.get<any>(this.jsonUrl); // Send GET request to fetch the mock data
  }

  fetchMockResources1(): Observable<any> {
    return this.httpService.getLocalMock('assets/data/topics.json');
    //return this.http.get<any>(this.jsonUrl); // Send GET request to fetch the mock data
  }

   getTopicsBySubjectOld(inputArr, subjectName) {
    const subject = inputArr.find(subj => subj.subject === subjectName);
    return subject ? subject.topics : [];
  }

  fetchSubjectData(subjectName) {
    return this.httpService.getLocalMock('assets/data/my-subjects.json').pipe(
      map((objects: any) => {
        return objects.find(obj => obj.title === subjectName); // Find the object by title
      })
    );
  }

  fetchSubjectTopics(subjectName) {
    return this.httpService.getLocalMock('assets/data/topic-store.json').pipe(
      map((objects: any) => {
        return objects.filter(obj => obj.subject === subjectName); // Find the object by title
      })
    );
  }

  getMockUserProfile(): Observable<any> {
    return this.httpService.getLocalMock('assets/data/profile.json');
  }

   getCountries(): Observable<Country[]> {
    return this.httpService.getLocalMock('assets/data/master/countries.json').pipe(
      map((data: any) => data as Country[])
    );
  }

  getMockSubjects(): Observable<Subject[]> {
    return this.httpService.getLocalMock('assets/data/master/subjects.json').pipe(
      map((data: any) => data as Subject[])
    );
  }
  
}
