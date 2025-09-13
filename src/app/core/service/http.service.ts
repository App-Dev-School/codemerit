import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  post(serviceName: string, data: any, headerOptions: any) {
    const url = environment.apiUrl + serviceName;
    return this.http.post(url, JSON.stringify(data), headerOptions);
  }

  postWithParams(serviceName: string, data: any, httpOptions: any) {
    const url = environment.apiUrl + serviceName;
    return this.http.post(url, JSON.stringify(data), httpOptions);
  }

  //make this default
  postData<T>(serviceName: string, data: any, apiKey: string = '') : Observable<T> {
    const url = environment.apiUrl + serviceName;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': apiKey
      })
    };
    return this.http.post<T>(url, data, httpOptions);
  }

  get(serviceName: string, apiKey: string = '') {
    const url = environment.apiUrl + serviceName;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': apiKey
      })
    };
    return this.http.get(url, httpOptions);
  }

  put(serviceName: string, data: any, apiKey: string = '') {
    const url = environment.apiUrl + serviceName;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': apiKey
      })
    };
    return this.http.put(url, data, httpOptions);
  }

  delete(serviceName: string, apiKey: string = '') {
    const url = environment.apiUrl + serviceName;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': apiKey
      })
    };
    return this.http.delete(url, httpOptions);
  }


  getWithoutAuth(serviceName: string) {
    const url = environment.apiUrl + serviceName;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.get(url, httpOptions);
  }

  getLocalMock(mockUrl: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.get(mockUrl, httpOptions);
  }

}
