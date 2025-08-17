import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService } from '@core';
import { QueestionListDto } from '@core/models/dtos/QuestionDtos';
import { HttpService } from '@core/service/http.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { QuestionItem } from './question-item.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private readonly API_URL = 'assets/data/topics.json';
  dataChange: BehaviorSubject<QuestionItem[]> = new BehaviorSubject<QuestionItem[]>([]);

  constructor(private authService: AuthService, private httpService: HttpService, private httpClient: HttpClient) { }

  getDummyTopics(): Observable<QuestionItem[]> {
    return this.httpClient
      .get<QuestionItem[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  //For specific user
  getAllQuestions(): Observable<QuestionItem[]> {
    let api_key = '';
    if (this.authService.currentUserValue && this.authService.currentUserValue.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/question'+'?subjectId=1';
    return this.httpService.get(url, api_key).pipe(
      map((response: QueestionListDto) => {
        return response.data;
      })
    );
  }

  addQuestion(payload: any): Observable<any> {
    let api_key = '';
    if (this.authService.currentUserValue && this.authService.currentUserValue.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': api_key
      })
    };
    const url = 'apis/question/create';
    return this.httpService.postWithParams(url, payload, httpOptions).pipe(
      map((response) => {
        return response;
      }),
      catchError(this.handleError)
    );
  }

  updateQuestion(payload: any, questionId: any): Observable<any> {
    let api_key = '';
    if (this.authService.currentUserValue && this.authService.currentUserValue.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/question/update?id=' + questionId;
    return this.httpService.put(url, payload, api_key).pipe(
      map((response) => {
        return response; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  deleteQuestion(id: number): Observable<number> {
    let api_key = '';
    if (this.authService.currentUserValue && this.authService.currentUserValue.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/question/delete?id=' + id;
    return this.httpService.delete(url, api_key).pipe(
      map((response) => {
        if (AuthConstants.DEV_MODE) {
          console.log("Hiting ", response);
        }
        return id;
      }),
      catchError(this.handleError)
    );;
  }

  /** Handle Http operation that failed */
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }
}
