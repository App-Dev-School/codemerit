import { CommonModule, DatePipe, formatDate, NgClass } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, User } from '@core';
import { Role } from '@core/models/role';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { CelebrationOverlayComponent } from '@shared/components/celebration-overlay/celebration-overlay.component';
import { Subject } from 'rxjs';

// apis/users now returns these analytics fields alongside the base User shape —
// scoped to this list page rather than added to the shared User model, since
// nothing else in the app reads them yet.
export interface UserListRow extends User {
  points?: number | null;
  numJobRoles?: number;
  numQuizTaken?: number;
  numAssessments?: number;
  jobRoleTitles?: string[];
}

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
    CelebrationOverlayComponent,
  ],
})
export class ListUserComponent implements OnInit, AfterViewInit, OnDestroy {

  allUsers: UserListRow[] = [];
  isLoading = true;

  searchQuery = '';
  currentPage = 0;
  readonly pageSize = 20;

  @ViewChild('celebs') celebrationOverlay?: CelebrationOverlayComponent;
  // Set from router state (create.component.ts's post-create navigate) — only
  // true for the navigation that immediately follows creating a new user, never
  // on a plain refresh/back, since getCurrentNavigation() is navigation-scoped.
  private justCreated = false;

  private destroy$ = new Subject<void>();

  constructor(
    public router: Router,
    public authService: AuthService,
    private route: ActivatedRoute,
  ) {
    const state = this.router.getCurrentNavigation()?.extras?.state as { justCreated?: boolean } | undefined;
    this.justCreated = !!state?.justCreated;
  }

  ngAfterViewInit(): void {
    if (this.justCreated) {
      // Small delay so the overlay's own ngAfterViewInit has sized its canvas
      // before we ask it to burst — otherwise the default center point is 0,0.
      setTimeout(() => this.celebrationOverlay?.triggerBurst(), 50);
    }
  }

  // ── Computed ──────────────────────────────────────────────

  // Talent-Partner-permission holders manage the same list framed as "Talent
  // Management" — mirrors create.component.ts's isAdminViewer/breadcrumb getters.
  get isAdminViewer(): boolean {
    return this.authService.currentUserValue?.role === Role.Admin;
  }

  get breadcrumbTitle(): string {
    return this.isAdminViewer ? 'User Management' : 'Talent Management';
  }

  get breadcrumbTrailLabel(): string {
    return this.isAdminViewer ? 'Users' : 'Talents';
  }

  get breadcrumbActiveItem(): string {
    return this.isAdminViewer ? 'List Users' : 'List Talents';
  }

  // Aggregate counts for the Talent Partner stats widget — computed client-side
  // from the already-loaded list, same as filteredUsers/paginatedUsers below.
  // "Certified" has no dedicated flag in the API sample given — approximated as
  // having at least one completed assessment alongside quiz activity.
  get talentStats() {
    return {
      added: this.allUsers.length,
      activated: this.allUsers.filter(u => u.accountStatus === 'ACTIVE').length,
      learning: this.allUsers.filter(u => (u.numQuizTaken ?? 0) > 0 || (u.numAssessments ?? 0) > 0).length,
      certified: this.allUsers.filter(u => (u.numAssessments ?? 0) > 0 && (u.numQuizTaken ?? 0) > 0).length,
    };
  }

  get filteredUsers(): UserListRow[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.allUsers;
    return this.allUsers.filter(u =>
      ((u.firstName || '') + ' ' + (u.lastName || '')).toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.country || '').toLowerCase().includes(q) ||
      (u.designation || '').toLowerCase().includes(q) ||
      (u.jobRoleTitles || []).join(' ').toLowerCase().includes(q)
    );
  }

  get paginatedUsers(): UserListRow[] {
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

  // Prefers the user's most recently added job role title over the static
  // designation field, falling back to designation when no job role exists yet.
  designationFor(user: UserListRow): string {
    return user.jobRoleTitles?.length
      ? user.jobRoleTitles[user.jobRoleTitles.length - 1]
      : (user.designation || '');
  }

  // ── Navigation ────────────────────────────────────────────

  addNew() { this.router.navigate(['/users/create']); }

  viewUser(row: UserListRow) { this.router.navigate(['/users/view', row.username]); }

  editUser(row: UserListRow) { this.router.navigate(['/users/edit', row.username]); }

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
