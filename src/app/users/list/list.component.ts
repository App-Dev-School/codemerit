import { CommonModule, DatePipe, formatDate, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, User } from '@core';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-list-users',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [
    BreadcrumbComponent,
    CommonModule,
    NgClass,
    FormsModule,
    RouterLink,
    DatePipe,
  ],
})
export class ListUserComponent implements OnInit, OnDestroy {

  allUsers: User[] = [];
  isLoading = true;

  searchQuery = '';
  currentPage = 0;
  readonly pageSize = 20;

  private destroy$ = new Subject<void>();

  constructor(
    public router: Router,
    public authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  // ── Computed ──────────────────────────────────────────────

  get filteredUsers(): User[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.allUsers;
    return this.allUsers.filter(u =>
      ((u.firstName || '') + ' ' + (u.lastName || '')).toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.country || '').toLowerCase().includes(q) ||
      (u.designation || '').toLowerCase().includes(q)
    );
  }

  get paginatedUsers(): User[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  get rangeStart(): number {
    return this.filteredUsers.length === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.filteredUsers.length);
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data ──────────────────────────────────────────────────

  loadData() {
    this.isLoading = true;
    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data.data || [];
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

  // ── Navigation ────────────────────────────────────────────

  addNew() { this.router.navigate(['/users/create']); }

  viewUser(row: User) { this.router.navigate(['/users/view', row.username]); }

  editUser(row: User) { this.router.navigate(['/users/edit', row.username]); }

  // ── Export ────────────────────────────────────────────────

  exportCsv() {
    const rows = this.filteredUsers.map(u => ({
      FirstName: u.firstName,
      LastName: u.lastName,
      Email: u.email,
      Country: u.country || '',
      Joined: u.createdAt ? formatDate(new Date(u.createdAt), 'yyyy-MM-dd', 'en') : '',
      Status: u.accountStatus || '',
    }));
    const header = Object.keys(rows[0] ?? {}).join(',');
    const csv = [header, ...rows.map(r => Object.values(r).map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Pagination ────────────────────────────────────────────

  prevPage() { if (this.currentPage > 0) this.currentPage--; }

  nextPage() { if (this.currentPage < this.totalPages - 1) this.currentPage++; }

  goToPage(page: number) { this.currentPage = page; }
}
