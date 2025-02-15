import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { IssuedItems } from './issued-items.model';

@Injectable({
  providedIn: 'root',
})
export class IssuedItemsService {
  private readonly API_URL = 'assets/data/issuedItems.json';
  dataChange: BehaviorSubject<IssuedItems[]> = new BehaviorSubject<
    IssuedItems[]
  >([]);

  constructor(private httpClient: HttpClient) {}

  /** GET: Fetch all issued items */
  getAllIssuedItems(): Observable<IssuedItems[]> {
    return this.httpClient
      .get<IssuedItems[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  /** POST: Add a new issued item */
  addIssuedItems(issuedItems: IssuedItems): Observable<IssuedItems> {
    return this.httpClient.post<IssuedItems>(this.API_URL, issuedItems).pipe(
      map(() => {
        return issuedItems; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  /** PUT: Update an existing issued item */
  updateIssuedItems(issuedItems: IssuedItems): Observable<IssuedItems> {
    return this.httpClient
      .put<IssuedItems>(`${this.API_URL}`, issuedItems)
      .pipe(
        map(() => {
          return issuedItems; // return response from API
        }),
        catchError(this.handleError)
      );
  }

  /** DELETE: Remove an issued item by ID */
  deleteIssuedItems(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}`).pipe(
      map(() => {
        return id; // return the ID of the deleted issued item
      }),
      catchError(this.handleError)
    );
  }

  /** Handle Http operation that failed */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something went wrong; please try again later.')
    );
  }
}
