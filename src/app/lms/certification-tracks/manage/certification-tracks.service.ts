import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@core';
import { HttpService } from '@core/service/http.service';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CertificationTrackItem } from './certification-track-item.model';

@Injectable({
  providedIn: 'root',
})
export class CertificationTrackService {
  constructor(
    private authService: AuthService,
    private httpService: HttpService,
  ) {}

  private getToken(): string {
    return this.authService.currentUserValue?.token ?? '';
  }

  getAllCertificationTracks(): Observable<CertificationTrackItem[]> {
    const token = this.getToken();
    return this.httpService.get('apis/certification-tracks/all', token).pipe(
      map((response: any) => response.data ?? response),
      catchError(this.handleError),
    );
  }

  createCertificationTrack(payload: any): Observable<any> {
    const token = this.getToken();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token,
      }),
    };
    return this.httpService.postWithParams('apis/certification-tracks/create', payload, httpOptions).pipe(
      map((response: any) => response),
      catchError(this.handleError),
    );
  }

  updateCertificationTrack(payload: any, id: number): Observable<any> {
    const token = this.getToken();
    return this.httpService.put('apis/certification-tracks/update/' + id, payload, token).pipe(
      map((response: any) => response),
      catchError(this.handleError),
    );
  }

  deleteCertificationTrack(id: number): Observable<number> {
    const token = this.getToken();
    return this.httpService.delete('apis/certification-tracks/delete/' + id, token).pipe(
      map(() => id),
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('CertificationTrackService error:', error);
    const apiMessage = error.error?.message ?? error.message ?? 'Something went wrong; please try again later.';
    return throwError(() => new Error(apiMessage));
  }
}
