import { DatePipe, DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, User } from '@core';
import { Role } from '@core/models/role';
import { MasterService } from '@core/service/master.service';
import { ThemeMode, ThemeService } from '@core/service/theme.service';
import { MyBadgesResponse } from '@core/models/gamification.model';
import { ProfileCourseStat, UserProfileResponse } from '@core/models/user-profile.model';
import { SubjectPerformanceCardComponent } from '@shared/components/subject-performance/subject-performance-card.component';
import { XpStreakWidgetComponent } from '@shared/components/xp-streak-widget/xp-streak-widget.component';
import { BadgeGridComponent } from '@shared/components/badge-grid/badge-grid.component';
import { CertificateRibbonComponent } from '@shared/components/certificate-ribbon/certificate-ribbon.component';
import { ProfileActivityTimelineComponent } from '@shared/components/profile-activity-timeline/profile-activity-timeline.component';

type ProfileTab = 'overview' | 'subjects' | 'quizzes' | 'badges' | 'assessments' | 'permissions' | 'settings';

interface EmailPreference {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

const EMAIL_PREFS_STORAGE_KEY = 'cm_email_preferences';

// Cross-field validator — matches the login-form's password rules (required,
// minLength 6) but this codebase has no existing confirm-password pattern to
// copy, so the match check is new.
function passwordsMatchValidator(group: FormGroup): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-user',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    SubjectPerformanceCardComponent,
    XpStreakWidgetComponent,
    BadgeGridComponent,
    CertificateRibbonComponent,
    ProfileActivityTimelineComponent,
  ],
})
export default class UserComponent implements OnInit {
  authData: User;
  userName = '';
  loading = true;
  selfView = true;
  userDetail: UserProfileResponse | null = null;
  noDataView = false;

  activeTab: ProfileTab = 'overview';
  readonly primaryTabs: { id: ProfileTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'badges', label: 'Badges & Certificates' },
    { id: 'assessments', label: 'Assessments' },
  ];
  badges: MyBadgesResponse | null = null;
  badgesLoading = false;
  private badgesFetched = false;

  // ── Settings tab ────────────────────────────────────────────────────────
  passwordForm: FormGroup;
  passwordHideCurrent = true;
  passwordHideNew = true;
  passwordSaving = false;

  emailPreferences: EmailPreference[] = [
    { key: 'productUpdates', label: 'Product Updates & Announcements', description: 'New features, subjects, and job roles as they launch.', enabled: true },
    { key: 'achievementEmails', label: 'Achievement & Progress Emails', description: 'Badges earned, level-ups, and certification milestones.', enabled: true },
    { key: 'quizReminders', label: 'Quiz Reminders', description: 'Nudges to keep your streak going and finish in-progress quizzes.', enabled: false },
  ];

  constructor(
    private route: ActivatedRoute,
    public ngRouter: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private master: MasterService,
    private fb: FormBuilder,
    public themeService: ThemeService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public dialog: MatDialog,
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: passwordsMatchValidator });
  }

  ngOnInit() {
    this.authData = this.authService.currentUserValue;
    this.takeRouteParams();
    this.loadEmailPreferences();
  }

  takeRouteParams() {
    this.route.paramMap.subscribe((params) => {
      if (params.get('userName')) {
        const userNameParam = params.get('userName');
        this.userName = userNameParam;
        this.selfView = false;
      } else {
        this.selfView = true;
        this.userName = this.authData.username;
      }
      this.loadData();
    });
  }

  public loadData() {
    this.loading = true;
    this.activeTab = 'overview';
    this.badgesFetched = false;
    this.badges = null;
    if (this.userName) {
      if (navigator.onLine) {
        this.authService.getFullProfile(this.userName, this.authData.token).subscribe(
          (data) => {
            this.loading = false;
            this.userDetail = data;
            if (!data) {
              this.noDataView = true;
              this.authService.redirectToErrorPage();
            }
          },
          (error: HttpErrorResponse) => {
            this.loading = false;
            this.authService.redirectToErrorPage();
            this.showNotification('snackbar-danger', 'Error fetching user details.', 'bottom', 'center');
          },
        );
      } else {
        this.showNotification('snackbar-danger', 'No Internet Connection', 'bottom', 'center');
      }
    }
  }

  setActiveTab(tab: ProfileTab): void {
    this.activeTab = tab;
    if (tab === 'badges' && !this.badgesFetched) {
      this.loadBadges();
    }
  }

  private loadBadges(): void {
    this.badgesLoading = true;
    this.badgesFetched = true;
    this.master.fetchMyBadges().subscribe((res) => {
      this.badges = res;
      this.badgesLoading = false;
    });
  }

  // Email/user-ID are only shown to the profile owner themselves, or to an
  // Admin viewer (not a Manager — the /users/view/:userName route already
  // gates to Admin+Manager at the route level, but Manager alone shouldn't
  // see another user's contact info).
  get canViewPrivateInfo(): boolean {
    return this.selfView || this.authData?.role === Role.Admin;
  }

  // Only Admin can actually reach /users/edit/:userName (route-guarded to
  // Admin only) — showing this to a non-admin self-viewer would be a dead
  // end, since there's no separate self-serve edit flow yet.
  get canEditProfile(): boolean {
    return this.authData?.role === Role.Admin;
  }

  goToEditProfile(): void {
    this.ngRouter.navigate(['/users/edit', this.userName]);
  }

  // isVisible is a display flag on the permission grant itself, not a
  // viewer-specific rule — hide isVisible:false entries for everyone,
  // including self-view, rather than showing every raw grant.
  get visiblePermissions() {
    return (this.userDetail?.permissions ?? []).filter((p) => p.isVisible);
  }

  // Real "my current totals" source at last — the sessionStorage-cache
  // stopgap flagged when xp-streak-widget was first built (Story 2 of the
  // gamification work) is no longer the only option; this profile endpoint
  // returns points/level/streak directly.
  get xpStreakStats() {
    const g = this.userDetail?.gamification;
    if (!g) return null;
    return { totalPoints: g.points, level: g.level, streak: g.streak, cachedAt: '' };
  }

  // ── Subjects tab groupings — same "In Progress / Ready to Begin" split
  // convention used on the Learning Dashboard. ────────────────────────────
  get inProgressSubjects(): ProfileCourseStat[] {
    return (this.userDetail?.courseStats ?? []).filter((s) => s.isSubscribed && (s.attempted ?? 0) > 0);
  }

  get subscribedSubjects(): ProfileCourseStat[] {
    return (this.userDetail?.courseStats ?? []).filter((s) => s.isSubscribed && !(s.attempted > 0));
  }

  get exploreSubjects(): ProfileCourseStat[] {
    return (this.userDetail?.courseStats ?? []).filter((s) => !s.isSubscribed);
  }

  // SubjectPerformanceCardComponent reads `accuracy`, courseStats calls it
  // `currentAccuracy` — a light field mapping, not a full re-shape.
  subjectCardData(subject: ProfileCourseStat): any {
    return { ...subject, accuracy: subject.currentAccuracy };
  }

  onEnrollSubject(subject: ProfileCourseStat): void {
    // enrollSubjects() resolves to the raw envelope on success (data
    // populated) or `{}` on failure — check for `data`, not just `!error`,
    // since the failure fallback also has `error` undefined.
    this.master.enrollSubjects([subject.id]).subscribe((res) => {
      if (res?.data) {
        subject.isSubscribed = true;
        this.showNotification('snackbar-success', `Enrolled in ${subject.title}.`, 'bottom', 'center');
      } else {
        this.showNotification('snackbar-danger', 'Could not enroll. Please try again.', 'bottom', 'center');
      }
    });
  }

  showNotification(colorName, text, placementFrom, placementAlign) {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }

  // ── Settings: Theme ─────────────────────────────────────────────────────
  setThemeMode(mode: ThemeMode): void {
    this.themeService.setMode(mode, this.document, this.renderer);
  }

  // ── Settings: Change Password ───────────────────────────────────────────
  get passwordMismatch(): boolean {
    const c = this.passwordForm.get('confirmPassword');
    return !!c?.touched && this.passwordForm.hasError('passwordMismatch');
  }

  onSubmitPasswordChange(): void {
    if (this.passwordForm.invalid || this.passwordSaving) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.passwordSaving = true;
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.authService.changePassword(this.authData.token, currentPassword, newPassword).subscribe({
      next: (res) => {
        this.passwordSaving = false;
        if (res && !res.error) {
          this.showNotification('snackbar-success', 'Password updated successfully.', 'bottom', 'center');
          this.passwordForm.reset();
        } else {
          this.showNotification('snackbar-danger', res?.message || 'Could not update password.', 'bottom', 'center');
        }
      },
      error: () => {
        this.passwordSaving = false;
        // Expected until the backend endpoint exists — see changePassword()'s comment in auth.service.ts.
        this.showNotification('snackbar-danger', 'Password change is not available yet. Please try again later.', 'bottom', 'center');
      },
    });
  }

  // ── Settings: Email Preferences ─────────────────────────────────────────
  // No backend model exists for this yet — persisted locally only, so it
  // survives reloads but won't follow the user to another device until a
  // real preferences endpoint exists.
  private loadEmailPreferences(): void {
    try {
      const raw = localStorage.getItem(EMAIL_PREFS_STORAGE_KEY);
      if (!raw) return;
      const saved: Record<string, boolean> = JSON.parse(raw);
      this.emailPreferences = this.emailPreferences.map((pref) => ({
        ...pref,
        enabled: saved[pref.key] ?? pref.enabled,
      }));
    } catch {
      // ignore malformed local data, defaults already set
    }
  }

  toggleEmailPreference(pref: EmailPreference): void {
    pref.enabled = !pref.enabled;
    const toSave: Record<string, boolean> = {};
    this.emailPreferences.forEach((p) => { toSave[p.key] = p.enabled; });
    localStorage.setItem(EMAIL_PREFS_STORAGE_KEY, JSON.stringify(toSave));
  }
}
