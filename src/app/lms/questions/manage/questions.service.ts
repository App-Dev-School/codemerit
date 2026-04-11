import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService } from '@core';
import { QueestionListDto } from '@core/models/dtos/QuestionDtos';
import { HttpService } from '@core/service/http.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import {
  FullQuestion,
  QuestionItem,
  QuestionItemDetail,
  QuestionViewerResponse,
} from './question-item.model';

export interface QuestionApiFilters {
  subject: number | null;
  topic: number | null;
  level: string;
  authorId: number;
}

export interface QuestionAuthor {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  dataChange: BehaviorSubject<QuestionItem[]> = new BehaviorSubject<
    QuestionItem[]
  >([]);

  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    private httpClient: HttpClient,
  ) {}

  getQuestionBySlug(slug: string): Observable<QuestionItemDetail> {
    let api_key = '';
    if (
      this.authService.currentUserValue &&
      this.authService.currentUserValue.token
    ) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/question/' + slug;
    return this.httpService.get(url, api_key).pipe(
      map(
        (response: {
          error: boolean;
          message: string;
          data: QuestionItemDetail;
        }) => {
          return response.data;
        },
      ),
    );
  }

  //For specific user
  getAllQuestions(fullData: boolean): Observable<FullQuestion[]> {
    let api_key = '';
    if (
      this.authService.currentUserValue &&
      this.authService.currentUserValue.token
    ) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/question' + (fullData ? '?fullData=true' : '');
    return this.httpService.get(url, api_key).pipe(
      map((response: QuestionViewerResponse) => {
        return response.data;
      }),
    );
  }

  getQuestionsWithFilters(
    fullData: boolean,
    filters?: QuestionApiFilters,
  ): Observable<FullQuestion[]> {
    let api_key = '';
    if (
      this.authService.currentUserValue &&
      this.authService.currentUserValue.token
    ) {
      api_key = this.authService.currentUserValue.token;
    }

    const params: string[] = [];
    if (fullData) {
      params.push('fullData=true');
    }

    if (filters) {
      if (filters.subject !== null && filters.subject !== undefined) {
        params.push(`subjectId=${encodeURIComponent(String(filters.subject))}`);
      }
      if (filters.topic !== null && filters.topic !== undefined) {
        params.push(`topicId=${encodeURIComponent(String(filters.topic))}`);
      }
      if (filters.level) {
        params.push(`level=${encodeURIComponent(filters.level)}`);
      }
      params.push(`authorId=${encodeURIComponent(String(filters.authorId))}`);
    }

    const url = `apis/question${params.length ? `?${params.join('&')}` : ''}`;

    return this.httpService
      .get(url, api_key)
      .pipe(map((response: QuestionViewerResponse) => response.data));
  }

  getQuestionAuthors(): Observable<QuestionAuthor[]> {
    let api_key = '';
    if (
      this.authService.currentUserValue &&
      this.authService.currentUserValue.token
    ) {
      api_key = this.authService.currentUserValue.token;
    }

    return this.httpService
      .get('apis/question/authors', api_key)
      .pipe(map((response: any) => response?.data ?? []));
  }

  fetchMyQuestions(payload: any): Observable<QuestionItemDetail[]> {
    let api_key = '';
    if (
      this.authService.currentUserValue &&
      this.authService.currentUserValue.token
    ) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/question/fetch';
    return this.httpService.postData(url, payload, api_key).pipe(
      map(
        (response: {
          error: boolean;
          message: string;
          data: QuestionItemDetail[];
        }) => {
          return response.data;
        },
      ),
    );
  }

  addQuestion(payload: any): Observable<any> {
    let api_key = '';
    if (
      this.authService.currentUserValue &&
      this.authService.currentUserValue.token
    ) {
      api_key = this.authService.currentUserValue.token;
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: api_key,
      }),
    };
    const url = 'apis/question/create';
    return this.httpService.postWithParams(url, payload, httpOptions);
  }

  updateQuestion(payload: any, questionId: any): Observable<any> {
    let api_key = '';
    if (
      this.authService.currentUserValue &&
      this.authService.currentUserValue.token
    ) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/question/update?id=' + questionId;
    return this.httpService.put(url, payload, api_key);
  }

  deleteQuestion(id: number): Observable<number> {
    let api_key = '';
    if (
      this.authService.currentUserValue &&
      this.authService.currentUserValue.token
    ) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/question/delete?id=' + id;
    return this.httpService.delete(url, api_key).pipe(
      map((response) => {
        if (AuthConstants.DEV_MODE) {
          console.log('Hiting ', response);
        }
        return id;
      }),
      catchError(this.handleError),
    );
  }

  whitelistQuestion(questionId: number): Observable<any> {
    let api_key = '';
    if (
      this.authService.currentUserValue &&
      this.authService.currentUserValue.token
    ) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/question/approval';
    const payload = { questionId, isWhitelisted: true };
    return this.httpService
      .put(url, payload, api_key)
      .pipe(catchError(this.handleError));
  }

  /** Handle Http operation that failed */
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.'),
    );
  }
}
