import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@core';
import { HttpService } from '@core/service/http.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SubjectTrackItem } from './subject-track-item.model';

@Injectable({
  providedIn: 'root',
})
export class SubjectTrackService {
  constructor(
    private authService: AuthService,
    private httpService: HttpService,
  ) {}

  private getToken(): string {
    return this.authService.currentUserValue?.token ?? '';
  }

  getAllSubjectTracks(): Observable<SubjectTrackItem[]> {
    const token = this.getToken();
    const url = 'apis/subject-tracks/all';
    return this.httpService.get(url, token).pipe(
      map((response: any) => response.data ?? response),
      catchError(this.handleError),
    );
  }

  createSubjectTrack(payload: any): Observable<any> {
    const token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token,
      }),
    };
    const url = 'apis/subject-tracks/create';
    return this.httpService.postWithParams(url, payload, httpOptions).pipe(
      map((response: any) => response),
      catchError(this.handleError),
    );
  }

  updateSubjectTrack(payload: any, id: number): Observable<any> {
    const token = this.getToken();
    const url = 'apis/subject-tracks/update/' + id;
    return this.httpService.put(url, payload, token).pipe(
      map((response: any) => response),
      catchError(this.handleError),
    );
  }

  deleteSubjectTrack(id: number): Observable<number> {
    const token = this.getToken();
    const url = 'apis/subject-tracks/delete/' + id;
    return this.httpService.delete(url, token).pipe(
      map(() => id),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('SubjectTrackService error:', error);
    const apiMessage = error.error?.message ?? error.message ?? 'Something went wrong; please try again later.';
    return throwError(() => new Error(apiMessage));
  }
}
