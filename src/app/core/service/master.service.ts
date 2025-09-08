import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Country } from '@core/models/country.data';
import { Subject } from '@core/models/subject';
import { JobRole } from '@core/models/subject-role';
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
    console.log("fetchMasterDataFromAPI() called");
    return this.httpService.get('apis/master/data', this.authService.currentUserValue?.token).pipe(
      tap((res: { error: boolean, message: string, data: MasterData }) => {
        if (!res.error) {
          console.log('MasterDataFlow Topics', res.data.topics);
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

    fetchSubjectDashboard(slug: string) {
    console.log("CourseDash fetchSubjectDashboard()", slug);
    return this.httpService.get('apis/master/subjectDashboard?slug='+slug, this.authService.currentUserValue?.token).pipe(
      tap((res: { error: boolean, message: string, data: MasterData }) => {
        console.log('CourseDash master subjectDashboard API response=>', res);
        if (!res.error) {
          //console.log('CourseDash master subjectDashboard API response=>', res.data);
        }
      }),
      catchError((err) => {
        console.log("CourseDash Error fetching subjectDashboard", err);
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

  fetchJobRoleSubjectMapping(): Observable<JobRole[]> {
  console.log('MasterDataFlow Invoking JobMap API');

  return this.httpService
    .get('apis/master/jobRoles', this.authService.currentUserValue?.token)
    .pipe(
      map((res: { error: boolean; message: string; data: JobRole[] }) => {
        if (!res.error) {
          console.log('MasterDataFlow JobMap API SUCCESS>>>', res.data);
          this.setJobRoleMap(res.data);
          return res.data; // ✅ make sure to return it
        }
        return []; // ✅ fallback return to satisfy type
      }),
      catchError((err) => {
        console.error('MasterDataFlow Failed to fetch job map', err);
        return of([]); // ✅ return empty array instead of null
      })
    );
}

//Delete this as unused
  getJobRoleMap() {
    return this.jobRoleSubjectMap;
  }

  setJobRoleMap(map: any) {
    this.jobRoleSubjectMap = map;
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
