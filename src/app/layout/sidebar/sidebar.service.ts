import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteInfo } from './sidebar.metadata';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private isCollapsed = new BehaviorSubject(false);
  watchIsCollapsed = this.isCollapsed.asObservable();
  constructor(private http: HttpClient) {}

  /**
   * Get sidebar menu items from JSON file
   * @returns Observable<RouteInfo[]>
   */
  getRouteInfo(): Observable<RouteInfo[]> {
    // Assuming the JSON file is in the assets folder
    return this.http
      .get<{ routes: RouteInfo[] }>('assets/data/routes.json')
      .pipe(map((response) => response.routes));
  }

  setCollapsed(value:boolean){
    //console.log("ResponsiveLogo NavCollapse Emitter=> "+value);
    this.isCollapsed.next(value);
  }
}
