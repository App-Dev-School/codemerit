import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Country } from '@core/models/country.data';
import { Subject } from '@core/models/subject';
import { Course } from '@core/models/subject-role';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { HttpService } from './http.service';
import { AdminDashboardResponse } from 'src/app/admin/dtos/admin-dashboard.model';
import { LmsDashboardResponse } from 'src/app/lms/dtos/lms-dashboard.model';

export interface MasterData {
  subjects: any[];
  topics: any[];
  jobRoles: any[];
  certificationTracks?: any[];
}
export interface JobSubject {
  id: number;
  title: string;
  description: string;
  image: string;
}

@Injectable({
  providedIn: 'root',
})
export class MasterService {
  private data: MasterData = { subjects: [], topics: [], jobRoles: [] };
  private jobRoleSubjectTracks: { [jobRoleId: number]: any[] } = {};
  private dataLoaded = new BehaviorSubject<boolean>(false);
  readonly dataLoaded$ = this.dataLoaded.asObservable();
  private storageKey = 'masterData';
  jobRoleSubjectMap: Course[];

  constructor(
    private router: Router,
    private httpService: HttpService,
    public authService: AuthService,
  ) {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Handle old cache format where the full API response wrapper was saved instead of
      // just the data object. Detect by checking if subjects array is nested under .data.
      const candidate: MasterData = parsed?.subjects ? parsed : parsed?.data;
      if (candidate?.subjects) {
        this.data = candidate;
        this.dataLoaded.next(true);
      }
    }
  }

  /***
   * Enhance to handle failures
   * To maintain sync using timestamp
   */
  fetchMasterDataFromAPI() {
    console.log('fetchMasterDataFromAPI() called');
    return this.httpService
      .get('apis/master/data', this.authService.currentUserValue?.token)
      .pipe(
        tap((res: { error: boolean; message: string; data: MasterData }) => {
          if (!res.error) {
            console.log('MasterDataFlow Topics', res.data.topics);
            this.data = res.data;
            // Index subjectTracks per job role so callers can fetch them later
            this.indexJobRoleSubjectTracks();
            // Save only res.data so the constructor can read it back as MasterData directly.
            localStorage.setItem(this.storageKey, JSON.stringify(res.data));
            this.dataLoaded.next(true);
          }
        }),
        catchError((err) => {
          console.log('MasterDataFlow Error fetching master data', err);
          return of(null);
        }),
      );
  }

  fetchSubjectDashboard(slug: string) {
    console.log('CourseDash fetchSubjectDashboard()', slug);
    return this.httpService
      .get(
        'apis/master/subjectDashboard?slug=' + slug,
        this.authService.currentUserValue?.token,
      )
      .pipe(
        tap((res: { error: boolean; message: string; data: MasterData }) => {
          console.log('CourseDash master subjectDashboard API response=>', res);
          if (!res.error) {
            //console.log('CourseDash master subjectDashboard API response=>', res.data);
          }
        }),
        catchError((err) => {
          console.log('CourseDash Error fetching subjectDashboard', err);
          return of(null);
        }),
      );
  }

  get subjects() {
    return this.data.subjects;
  }
  get topics() {
    return this.data.topics;
  }
  get jobRoles() {
    return this.data.jobRoles;
  }

  /**
   * Return subjectTracks array for a given jobRole id (may be empty array)
   */
  getJobRoleSubjectTracks(jobRoleId: number): any[] {
    return this.jobRoleSubjectTracks[jobRoleId] ?? [];
  }

  private indexJobRoleSubjectTracks(): void {
    this.jobRoleSubjectTracks = {};
    if (!this.data?.jobRoles?.length) return;
    this.data.jobRoles.forEach((jr: any) => {
      const tracks = Array.isArray(jr.subjectTracks) ? jr.subjectTracks : [];
      this.jobRoleSubjectTracks[jr.id] = tracks;
      // ensure count fields exist for convenience
      try {
        jr.subjectTracksCount = tracks.length;
        jr.certificationTrackCount = jr.certificationTrackCount ?? (Array.isArray(jr.certificationTracks) ? jr.certificationTracks.length : 0);
      } catch (_) {
        // silent
      }
    });
  }

  clear() {
    this.data = { subjects: [], topics: [], jobRoles: [] };
    localStorage.removeItem(this.storageKey);
    this.dataLoaded.next(false);
    alert('Local data cleared!');
  }

  //Not needed then clean
  fetchJobRoleSubjectMapping(): Observable<Course[]> {
    console.log('MasterDataFlow Invoking JobMap API');

    return this.httpService
      .get('apis/master/jobRoles', this.authService.currentUserValue?.token)
      .pipe(
        map((res: { error: boolean; message: string; data: Course[] }) => {
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
        }),
      );
  }

    fetchCourseDetail(slug:string): Observable<any> {
    console.log('Calling fetchCourseDetail API');
    return this.httpService
      .get(
        'apis/master/programDetails/' + slug,
        this.authService.currentUserValue?.token,
      )
      .pipe(
        map((res: { error: boolean; message: string; data: any }) => {
          if (!res.error) {
            console.log('CourseAPI success', res.data);
            return res.data;
          }
          return {};
        }),
        catchError((err) => {
          console.error('CourseAPI Failed :', err);
          return of({}); // return empty array instead of null
        }),
      );
  }

  fetchCourseDashboard(): Observable<any> {
    console.log('Calling fetchCourseDashboard API');
    return this.httpService
      .get(
        'apis/master/myCareerDashboard',
        this.authService.currentUserValue?.token,
      )
      .pipe(
        map((res: { error: boolean; message: string; data: any }) => {
          if (!res.error) {
            console.log('CourseAPI success', res.data);
            //this.setJobRoleMap(res.data);
            return res.data; // make sure to return it
          }
          return {}; // fallback return to satisfy type
        }),
        catchError((err) => {
          console.error('CourseAPI Failed :', err);
          return of({}); // return empty array instead of null
        }),
      );
  }

  enrollSubjects(subjectIds: number[]): Observable<any> {
    const payload = {
      subjectIds: subjectIds,
    };
    console.log('Calling enrollSubjects API', payload);
    return this.httpService
      .postData(
        'apis/master/userSubjects',
        payload,
        this.authService.currentUserValue?.token,
      )
      .pipe(
        map((res: { error: boolean; message: string; data: any }) => {
          if (!res.error) {
            console.log('MasterDataFlow JobMap API SUCCESS>>>', res.data);
            //this.setJobRoleMap(res.data);
            //return res.data;
            return res;
          }
          return {};
        }),
        catchError((err) => {
          console.error('enrollSubjects Failed', err);
          return of({});
        }),
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
    return this.httpService
      .getLocalMock('assets/data/master/countries.json')
      .pipe(map((data: any) => data as Country[]));
  }

  fetchMockSubjectDashboard(): Observable<any> {
    return this.httpService.getLocalMock(
      'assets/data/master/subjectDashboard.json',
    );
  }

  getMockAdminDashboard(): Observable<any> {
    return this.httpService
      .getLocalMock('assets/data/master/adminDash.json')
      .pipe(map((data: any) => data as any));
  }

  getAdminDashboard(): Observable<AdminDashboardResponse> {
    const api_key = this.authService.currentUserValue?.token ?? '';
    const url = 'apis/admin/dashboard';
    return this.httpService
      .get(url, api_key)
      .pipe(map((res: any) => res as AdminDashboardResponse));
  }

  getLmsDashboard(): Observable<LmsDashboardResponse> {
    const api_key = this.authService.currentUserValue?.token ?? '';
    const url = 'apis/lms/dashboard';
    return this.httpService.get(url, api_key).pipe(
      map((res: any) => res as LmsDashboardResponse),
      catchError(() => this.getMockAdminDashboard()),
    );
  }
}
