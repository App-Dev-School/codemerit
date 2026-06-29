import { Injectable } from '@angular/core';
import { AuthService } from '@core/service/auth.service';
import { HttpService } from '@core/service/http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  constructor(
    private authService: AuthService,
    private httpService: HttpService
  ) {}

  createLesson(payload: any): Observable<any> {
    const apiKey = this.authService.currentUserValue?.token || '';
    return this.httpService.postData('apis/lesson/create', payload, apiKey);
  }

  getLessons(n = 10, fetch?: 'all'): Observable<any> {
    const apiKey = this.authService.currentUserValue?.token || '';
    const params = [`n=${n}`];
    if (fetch) {
      params.push(`fetch=${fetch}`);
    }
    return this.httpService.get(`apis/lesson?${params.join('&')}`, apiKey);
  }

  getLessonBySlug(slug: string): Observable<any> {
    return this.httpService.get(`apis/lesson/${slug}`);
  }
}
