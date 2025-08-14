import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from '@core/service/http.service';
import { environment } from 'src/environments/environment';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService } from '@core';
import { Quiz } from '@core/models/quiz';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private readonly API_URL = 'assets/data/quizzes/quiz-angular.json';
  dataChange: BehaviorSubject<Quiz[]> = new BehaviorSubject<Quiz[]>([]);

  constructor(private authService: AuthService, private httpService: HttpService, private httpClient: HttpClient) {}

  getDummyTopics(): Observable<Quiz[]> {
    return this.httpClient
      .get<Quiz[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  getAllQuiz(): Observable<Quiz[]> {
   let api_key = '';
    if(this.authService.currentUser && this.authService.currentUser){
    api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/quiz/all';
  if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " via Token " + api_key);
    }
    return this.httpService.get(url, api_key).pipe(
      map((response: any) => {
        return response.data; // return response from API
      })
    );
  }

  addQuiz(item: any): Observable<any> {
    let api_key = '';
    if(this.authService.currentUser && this.authService.currentUser){
    api_key = this.authService.currentUserValue.token;
    }
    const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': api_key
          })
        };
        const url = 'apis/quiz/create';
        if (AuthConstants.DEV_MODE) {
          console.log("Hiting " + url + " with => " + JSON.stringify(item) + " via Token " + api_key);
        }
        return this.httpService.postWithParams(url, item, httpOptions).pipe(
      map((response) => {
        return response; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  updateQuiz(topic: any, topicId:any): Observable<any> {
    let api_key = '';
    if(this.authService.currentUser && this.authService.currentUser){
    api_key = this.authService.currentUserValue.token;
    }
    const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': api_key
          })
        };
        const url = 'apis/quiz/update/'+topicId;
        if (AuthConstants.DEV_MODE) {
          console.log("Hiting " + url + " with => " + JSON.stringify(topic) + " via Token " + api_key);
        }
        return this.httpService.put(url, topic, api_key).pipe(
      map((response) => {
        return response; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  deleteQuiz(id: number): Observable<number> {
     let api_key = '';
    if(this.authService.currentUser && this.authService.currentUser){
    api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/quiz/delete/'+id;
    return this.httpService.delete(url, api_key).pipe(
      map((response) => {
        if (AuthConstants.DEV_MODE) {
          console.log("Hiting ", response);
        }
        return id; // return the ID of the deleted doctor
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
