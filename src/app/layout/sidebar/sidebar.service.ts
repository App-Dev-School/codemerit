import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from '@core/service/http.service';
import { RouteInfo } from './sidebar.metadata';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  constructor(private httpService: HttpService) {}
  /**
   * Get sidebar menu items from JSON file
   * @returns Observable<RouteInfo[]>
   */
  // getRouteInfo(): Observable<RouteInfo[]> {
  //   // Assuming the JSON file is in the assets folder
  //   return this.http
  //     .get<{ routes: RouteInfo[] }>('assets/data/routes.json')
  //     .pipe(map((response) => response.routes));
  // }

  getRouteInfo(): Observable<RouteInfo[]> {
    const url = 'apis/master/routes';
    return this.httpService
      .get(url)
      .pipe(
        map(
          (response: any) => response.routes ?? response.data ?? response ?? [],
        ),
      );
  }
}
