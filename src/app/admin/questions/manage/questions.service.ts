import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService } from '@core';
import { QueestionListDto } from '@core/models/dtos/QuestionDtos';
import { HttpService } from '@core/service/http.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { FullQuestion, QuestionItem, QuestionItemDetail, QuestionViewerResponse } from './question-item.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  dataChange: BehaviorSubject<QuestionItem[]> = new BehaviorSubject<QuestionItem[]>([]);

  constructor(private authService: AuthService, private httpService: HttpService, private httpClient: HttpClient) { }

   getQuestionBySlug(slug: string): Observable<QuestionItemDetail> {
    let api_key = '';
    if (this.authService.currentUserValue && this.authService.currentUserValue.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/question/'+slug;
    return this.httpService.get(url, api_key).pipe(
      map((response: {error:boolean,message:string,data:QuestionItemDetail}) => {
        return response.data;
      })
    );
  }

  //For specific user
  getAllQuestions(fullData:boolean): Observable<FullQuestion[]> {
    let api_key = '';
    if (this.authService.currentUserValue && this.authService.currentUserValue.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/question'+(fullData ? '?fullData=true' : '');
    return this.httpService.get(url, api_key).pipe(
      map((response: QuestionViewerResponse) => {
        return response.data;
      })
    );
  }

   fetchMyQuestions(payload: any): Observable<QuestionItemDetail[]> {
    let api_key = '';
    if (this.authService.currentUserValue && this.authService.currentUserValue.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/question/fetch';
    return this.httpService.postData(url, payload, api_key).pipe(
      map((response: {error:boolean,message:string,data:QuestionItemDetail[]}) => {
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
    return this.httpService.postWithParams(url, payload, httpOptions).pipe(delay(3000),
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
    return this.httpService.put(url, payload, api_key).pipe(delay(1000),
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
