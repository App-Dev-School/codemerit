import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { ItemStockList } from './item-stock-list.model';

@Injectable({
  providedIn: 'root',
})
export class ItemStockListService {
  private readonly API_URL = 'assets/data/itemStockList.json';
  dataChange: BehaviorSubject<ItemStockList[]> = new BehaviorSubject<
    ItemStockList[]
  >([]);

  constructor(private httpClient: HttpClient) {}

  /** GET: Fetch all item stock lists */
  getAllItemStockLists(): Observable<ItemStockList[]> {
    return this.httpClient
      .get<ItemStockList[]>(this.API_URL)
      .pipe(catchError(this.handleError));
  }

  /** POST: Add a new item stock list */
  addItemStockList(itemStockList: ItemStockList): Observable<ItemStockList> {
    return this.httpClient
      .post<ItemStockList>(this.API_URL, itemStockList)
      .pipe(
        map(() => {
          return itemStockList; // return response from API
        }),
        catchError(this.handleError)
      );
  }

  /** PUT: Update an existing item stock list */
  updateItemStockList(itemStockList: ItemStockList): Observable<ItemStockList> {
    return this.httpClient
      .put<ItemStockList>(`${this.API_URL}`, itemStockList)
      .pipe(
        map(() => {
          return itemStockList; // return response from API
        }),
        catchError(this.handleError)
      );
  }

  /** DELETE: Remove an item stock list by ID */
  deleteItemStockList(id: number): Observable<number> {
    return this.httpClient.delete<void>(`${this.API_URL}`).pipe(
      map(() => {
        return id; // return the ID of the deleted item stock list
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
