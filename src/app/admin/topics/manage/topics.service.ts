import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { TopicItem } from './topic-item.model';
import { HttpService } from '@core/service/http.service';
import { environment } from 'src/environments/environment';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService } from '@core';

@Injectable({
  providedIn: 'root',
})
export class TopicService {
  private readonly API_URL = 'assets/data/topics.json';
  dataChange: BehaviorSubject<TopicItem[]> = new BehaviorSubject<TopicItem[]>([]);

  constructor(private authService: AuthService, private httpService: HttpService, private httpClient: HttpClient) {}

  getAllTopics(): Observable<TopicItem[]> {
    return this.httpClient
      .get<TopicItem[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  addTopic(item: any): Observable<any> {
    // API call to add
    // return this.httpClient.post<TopicItem>(this.API_URL, item).pipe(
    //   map((response) => {
    //     return response; // return response from API
    //   }),
    //   catchError(this.handleError)
    // );
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
        const url = 'apis/topics/create';
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

  /** PUT: Update an existing doctor */
  updateTopic(topic: any): Observable<any> {
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
        const url = 'apis/topics/update/'+topic.id;
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

  deleteTopic(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}`).pipe(
      map((response) => {
        return id; // return the ID of the deleted doctor
      }),
      catchError(this.handleError)
    );
  }

  /** Handle Http operation that failed */
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }
}
