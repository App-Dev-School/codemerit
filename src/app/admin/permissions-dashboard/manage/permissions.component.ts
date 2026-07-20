import { Direction } from '@angular/cdk/bidi';
import { CommonModule, DatePipe, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { UserPermission } from '@core/models/permission.model';
import { SnackbarService } from '@core/service/snackbar.service';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { Subject } from 'rxjs';
import { permissionsrevokeComponent } from './dialogs/delete/delete.component';
import { UserPermissionsFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { permissionsService } from './permissions.service';

@Component({
  selector: 'app-manage-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.scss'],
  imports: [
    BreadcrumbComponent,
    CommonModule,
    NgClass,
    FormsModule,
    DatePipe,
    RouterLink,
  ],
})
export class permissionsComponent implements OnInit, OnDestroy {

  allPermissions: UserPermission[] = [];
  isLoading = true;

  searchQuery = '';
  currentPage = 0;
  readonly pageSize = 15;

  private destroy$ = new Subject<void>();

  constructor(
    public dialog: MatDialog,
    public permissionsService: permissionsService,
    private snackService: SnackbarService,
  ) {}

  // ── Computed ──────────────────────────────────────────────

  get filteredPermissions(): UserPermission[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.allPermissions;
    return this.allPermissions.filter(p =>
      (p.user?.firstName + ' ' + p.user?.lastName).toLowerCase().includes(q) ||
      (p.permissionName || '').toLowerCase().includes(q) ||
      (p.resourceName || '').toLowerCase().includes(q) ||
      (p.resourceType || '').toLowerCase().includes(q)
    );
  }

  get paginatedPermissions(): UserPermission[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredPermissions.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPermissions.length / this.pageSize);
  }

  get rangeStart(): number {
    return this.filteredPermissions.length === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.filteredPermissions.length);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const cur = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages = new Set<number>([0, total - 1, cur]);
    for (let d = -2; d <= 2; d++) {
      const p = cur + d;
      if (p >= 0 && p < total) pages.add(p);
    }
    return Array.from(pages).sort((a, b) => a - b);
  }

  // ── Lifecycle ─────────────────────────────────────────────

  ngOnInit() {
    this.permissionsService.getAllPermissions().subscribe(data => {
      this.permissionsService.setPermissions(data);
    });
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data ──────────────────────────────────────────────────

  loadData() {
    this.isLoading = true;
    this.permissionsService.getAllUserPermissions().subscribe({
      next: (data) => {
        this.allPermissions = data;
        this.currentPage = 0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  refresh() { this.loadData(); }

  onSearchChange() { this.currentPage = 0; }

  // ── Actions ───────────────────────────────────────────────

  addNew() { this.openDialog('add'); }

  editCall(row: UserPermission) { this.openDialog('edit', row); }

  openDialog(action: 'add' | 'edit', data?: UserPermission) {
    const varDirection: Direction = localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';
    const dialogRef = this.dialog.open(UserPermissionsFormComponent, {
      width: '500px',
      minWidth: '500px',
      data: { permissionsItem: data, action },
      direction: varDirection,
      autoFocus: false,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (action === 'add' && result.data) {
          const newItems: UserPermission[] = Array.isArray(result.data) ? result.data : [result.data];
          this.allPermissions = [...newItems, ...this.allPermissions];
          this.currentPage = 0;
        }
        if (result.message) {
          this.snackService.display(action === 'add' ? 'snackbar-success' : 'snackbar-dark', result.message, 'bottom', 'center');
        }
      }
    });
  }

  revokeItem(row: UserPermission) {
    const dialogRef = this.dialog.open(permissionsrevokeComponent, { data: row });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.allPermissions = this.allPermissions.filter(r => r.id !== row.id);
        this.snackService.display('snackbar-danger', (row.permissionName ?? 'Permission') + ' revoked successfully.', 'bottom', 'center');
      }
    });
  }

  // ── Pagination ────────────────────────────────────────────

  prevPage() { if (this.currentPage > 0) this.currentPage--; }

  nextPage() { if (this.currentPage < this.totalPages - 1) this.currentPage++; }

  goToPage(page: number) { this.currentPage = page; }
}
