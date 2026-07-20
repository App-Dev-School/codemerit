import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService } from '@core';
import {
  PermissionGroup,
  PermissionRequest,
  PermissionRequestStatus,
  RequestablePermissionGroup,
  UserPermissionItem,
} from '@core/models/permission.model';
import { HttpService } from '@core/service/http.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class permissionsService {

  private readonly API_URL = 'assets/data/permissions.json';
  dataChange: BehaviorSubject<UserPermissionItem[]> = new BehaviorSubject<UserPermissionItem[]>([]);
  masterPermissions: PermissionGroup[] = [];

  constructor(private authService: AuthService, private httpService: HttpService, private httpClient: HttpClient) { }

  setPermissions(data: PermissionGroup[]) {
    this.masterPermissions = data;
  }

  getSavedMasterPermissions(): PermissionGroup[] {
    return this.masterPermissions;
  }

  // Response is grouped: [{ group, permissions: Permission[] }, ...]. The
  // server orders by group ASC, so the "Ungrouped" bucket (permissions with
  // no group set) sorts first — push it to the end instead, since it reads
  // oddly as the lead group in an admin-facing picker.
  getAllPermissions(): Observable<PermissionGroup[]> {
    const url = 'apis/permissions/master-permissions';
    return this.httpService.getWithoutAuth(url).pipe(
      map((response: any) => {
        const groups: PermissionGroup[] = response.data ?? response ?? [];
        return [...groups].sort((a, b) =>
          a.group === 'Ungrouped' ? 1 : b.group === 'Ungrouped' ? -1 : a.group.localeCompare(b.group)
        );
      })
    );
  }

  getAllUserPermissions(): Observable<UserPermissionItem[]> {
    let api_key = '';
    if (this.authService.currentUserValue?.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/permissions/user-permissions';
    return this.httpService.get(url, api_key).pipe(
      map((response: any) => response.data)
    );
  }

  getAllUsers(): Observable<any[]> {
    let api_key = '';

    if (this.authService.currentUserValue?.token) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/users';
    return this.httpService.get(url, api_key).pipe(
      map((response: any) => response.data)
    );
  }

  addPermissions(item: any): Observable<any> {
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
    const url = 'apis/permissions/grant';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + JSON.stringify(item) + " via Token " + api_key);
    }
    return this.httpService.postWithParams(url, item, httpOptions);
  }

  updatePermissions(permissions: any, itemId: any): Observable<any> {
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
    const url = 'apis/permissions/update/' + itemId;
    return this.httpService.put(url, permissions, api_key);
  }

  revokePermissions(id: number): Observable<any> {
    let api_key = '';
    if (this.authService.currentUserValue && this.authService.currentUserValue.token) {
      api_key = this.authService.currentUserValue.token;
    }
    //const url = 'apis/permissions/revoke/' + id;
    const url = `apis/permissions/revoke?id=${id}`;
    return this.httpService.delete(url, api_key);
  }

  // ── Self-service request-to-approve flow ─────────────────────────

  private get api_key(): string {
    return this.authService.currentUserValue?.token ?? '';
  }

  getRequestablePermissions(): Observable<RequestablePermissionGroup[]> {
    const url = 'apis/permissions/requestable';
    return this.httpService.get(url, this.api_key).pipe(
      map((response: any) => response.data ?? response ?? [])
    );
  }

  requestPermission(payload: { permissionId: number; comment: string; resourceType?: string; resourceId?: number }): Observable<PermissionRequest> {
    const url = 'apis/permissions/request';
    return this.httpService.postData<any>(url, payload, this.api_key).pipe(
      map((response: any) => response.data ?? response)
    );
  }

  // Caller's own request history — never another user's.
  getMyRequests(status?: PermissionRequestStatus): Observable<PermissionRequest[]> {
    const url = 'apis/permissions/my-requests' + (status ? `?status=${status}` : '');
    return this.httpService.get(url, this.api_key).pipe(
      map((response: any) => response.data ?? response ?? [])
    );
  }

  // Admin / Role:LearningAdmin only — every user's requests.
  getPermissionRequests(status?: PermissionRequestStatus): Observable<PermissionRequest[]> {
    const url = 'apis/permissions/requests' + (status ? `?status=${status}` : '');
    return this.httpService.get(url, this.api_key).pipe(
      map((response: any) => response.data ?? response ?? [])
    );
  }

  // Approve creates the real grant; reject creates no grant. Both 409 if the
  // request isn't PENDING anymore (already decided).
  reviewPermissionRequest(id: number, action: 'approve' | 'reject', reviewComment?: string): Observable<any> {
    const url = `apis/permissions/requests/${id}/${action}`;
    const payload = reviewComment ? { reviewComment } : {};
    return this.httpService.postData<any>(url, payload, this.api_key);
  }
}
