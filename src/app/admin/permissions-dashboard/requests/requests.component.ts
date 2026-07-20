import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { PermissionRequest, PermissionRequestStatus } from '@core/models/permission.model';
import { SnackbarService } from '@core/service/snackbar.service';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { permissionsService } from '../manage/permissions.service';
import { ReviewRequestDialogComponent } from './dialogs/review-dialog/review-dialog.component';

@Component({
  selector: 'app-permission-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
  imports: [
    BreadcrumbComponent,
    CommonModule,
    FormsModule,
    DatePipe,
    RouterLink,
  ],
})
export class PermissionRequestsComponent implements OnInit {

  readonly statusTabs: { id: PermissionRequestStatus; label: string }[] = [
    { id: 'PENDING', label: 'Pending' },
    { id: 'APPROVED', label: 'Approved' },
    { id: 'REJECTED', label: 'Rejected' },
  ];

  requests: PermissionRequest[] = [];
  isLoading = true;
  statusFilter: PermissionRequestStatus = 'PENDING';

  searchQuery = '';
  currentPage = 0;
  readonly pageSize = 15;

  constructor(
    public dialog: MatDialog,
    public permissionsService: permissionsService,
    private snackService: SnackbarService,
  ) {}

  // ── Computed ──────────────────────────────────────────────

  get filteredRequests(): PermissionRequest[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.requests;
    return this.requests.filter(r =>
      (r.user?.firstName + ' ' + r.user?.lastName).toLowerCase().includes(q) ||
      (r.permission?.permission || '').toLowerCase().includes(q) ||
      (r.comment || '').toLowerCase().includes(q)
    );
  }

  get paginatedRequests(): PermissionRequest[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredRequests.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRequests.length / this.pageSize);
  }

  get rangeStart(): number {
    return this.filteredRequests.length === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.filteredRequests.length);
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
    this.loadData();
  }

  // ── Data ──────────────────────────────────────────────────

  loadData() {
    this.isLoading = true;
    this.permissionsService.getPermissionRequests(this.statusFilter).subscribe({
      next: (data) => {
        this.requests = data ?? [];
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

  setStatusFilter(status: PermissionRequestStatus) {
    if (this.statusFilter === status) return;
    this.statusFilter = status;
    this.searchQuery = '';
    this.loadData();
  }

  // ── Actions ───────────────────────────────────────────────

  review(row: PermissionRequest, action: 'approve' | 'reject') {
    const dialogRef = this.dialog.open(ReviewRequestDialogComponent, {
      width: '420px',
      minWidth: '320px',
      autoFocus: false,
      disableClose: true,
      data: { request: row, action },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.requests = this.requests.filter(r => r.id !== row.id);
        this.snackService.display(
          action === 'approve' ? 'snackbar-success' : 'snackbar-dark',
          `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
          'bottom', 'center'
        );
      }
    });
  }

  // ── Pagination ────────────────────────────────────────────

  prevPage() { if (this.currentPage > 0) this.currentPage--; }

  nextPage() { if (this.currentPage < this.totalPages - 1) this.currentPage++; }

  goToPage(page: number) { this.currentPage = page; }
}
