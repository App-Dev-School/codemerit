import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Country } from '@core/models/country.data';
import { Subject } from '@core/models/subject';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';

export interface MasterData {
  subjects: any[];
  topics: any[];
  jobRoles: any[];
}
export interface JobSubject {
  id: number;
  title: string;
  description: string;
  image: string;
}

export interface JobRole {
  id: number;
  title: string;
  slug: string;
  subjects: JobSubject[];
}

@Injectable({
  providedIn: 'root'
})
export class MasterService {
  private data: MasterData = { subjects: [], topics: [], jobRoles: [] };
  private dataLoaded = new BehaviorSubject<boolean>(false);
  readonly dataLoaded$ = this.dataLoaded.asObservable();
  private storageKey = 'masterData';
  jobRoleSubjectMap: JobRole[];


  constructor(private router: Router, private httpService: HttpService,
    public authService: AuthService) {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      this.data = JSON.parse(stored);
      this.dataLoaded.next(true);
    }
  }

  /***
   * Enhance to handle failures
   * To maintain sync using timestamp
   */
  fetchMasterDataFromAPI() {
    return this.httpService.getWithoutAuth('apis/master/data').pipe(
      tap((res: { error: boolean, message: string, data: MasterData }) => {
        if (!res.error) {
          console.log('MasterDataFlow master data fetched', res.data);
          this.data = res.data;
          localStorage.setItem(this.storageKey, JSON.stringify(res));
          this.dataLoaded.next(true);
        }
      }),
      catchError((err) => {
        console.log("MasterDataFlow Error fetching master data", err);
        return of(null);
      })
    );
  }

  get subjects() { return this.data.subjects; }
  get topics() { return this.data.topics; }
  get jobRoles() { return this.data.jobRoles; }

  clear() {
    this.data = { subjects: [], topics: [], jobRoles: [] };
    localStorage.removeItem(this.storageKey);
    this.dataLoaded.next(false);
  }

  fetchJobRoleSubjectMapping() {
    console.log('MasterDataFlow Invoking JobMap API');
    return this.httpService.getWithoutAuth('apis/master/jobRoles').pipe(
      tap((res: { error: boolean, message: string, data: any }) => {
        if (!res.error) {
          console.log('MasterDataFlow JobMap API SUCCESS>>>', res.data);
          this.setJobRoleMap(res.data);
        }
      }),
      catchError((err) => {
        console.error('MasterDataFlow Failed to fetch job map', err);
        return of(null);
      })
    );
  }

  getJobRoleMap() {
    return this.jobRoleSubjectMap;
  }

  setJobRoleMap(map: any) {
    this.jobRoleSubjectMap = map;
  }

  /*** 
   * Mocking all subjects data *
   * ****/
  getMockSubjectDashboard(): Observable<any> {
    return this.httpService.getLocalMock('assets/data/subjectDashboard.json');
  }

  fetchSubjectRoleMap(): Observable<any> {
    return this.httpService.getLocalMock('assets/data/master/subjectWithRoles.json');
  }

  fetchSubjectData(subjectName) {
    return this.httpService.getLocalMock('assets/data/subjectDashboard.json').pipe(
      map((objects: any) => {
        return objects.find(obj => obj.title === subjectName);
      })
    );
  }

  //Delete topic-store.json and subjectdashboard.json
  fetchAllSubjectTopics(subjectName) {
    console.log(subjectName, "MasterTopics", this.topics);
    const dd = this.topics.filter(obj => obj.subject === subjectName);
    console.log("MasterTopics for "+subjectName, dd);

    return this.httpService.getLocalMock('assets/data/topic-store.json').pipe(
      map((objects: any) => {
        return objects.filter(obj => obj.subject === subjectName); // Find the object by title
      })
    );
    //return of(this.topics.filter(obj => obj.subject === subjectName))
  }

  getCountries(): Observable<Country[]> {
    return this.httpService.getLocalMock('assets/data/master/countries.json').pipe(
      map((data: any) => data as Country[])
    );
  }

  getMockDataSubjects(): Observable<Subject[]> {
    return this.httpService.getLocalMock('assets/data/master/subjects.json').pipe(
      map((data: any) => data as Subject[])
    );
  }

}
