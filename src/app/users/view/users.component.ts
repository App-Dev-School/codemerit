import { DatePipe, DecimalPipe, DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, User } from '@core';
import { Role } from '@core/models/role';
import { MasterService } from '@core/service/master.service';
import { ThemeMode, ThemeService } from '@core/service/theme.service';
import { SpeechProfile, SpeechService } from '@core/service/speech.service';
import { MyBadgesResponse } from '@core/models/gamification.model';
import { PermissionRequest, RequestablePermission, RequestablePermissionGroup } from '@core/models/permission.model';
import { ProfileCourseStat, UserProfileResponse } from '@core/models/user-profile.model';
import { permissionsService } from '../../admin/permissions-dashboard/manage/permissions.service';
import { RequestPermissionDialogComponent } from './dialogs/request-permission-dialog/request-permission-dialog.component';
import { SubjectPerformanceCardComponent } from '@shared/components/subject-performance/subject-performance-card.component';
import { XpStreakWidgetComponent } from '@shared/components/xp-streak-widget/xp-streak-widget.component';
import { BadgeGridComponent } from '@shared/components/badge-grid/badge-grid.component';
import { BadgeEarnedCardComponent } from '@shared/components/badge-earned-card/badge-earned-card.component';
import { CertificateRibbonComponent } from '@shared/components/certificate-ribbon/certificate-ribbon.component';
import { ProfileActivityTimelineComponent } from '@shared/components/profile-activity-timeline/profile-activity-timeline.component';

type ProfileTab = 'overview' | 'subjects' | 'quizzes' | 'badges' | 'assessments' | 'permissions' | 'settings';

interface EmailPreference {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface VoiceSettings {
  voiceURI: string;
  rate: number;
  pitch: number;
  volume: number;
  profile: SpeechProfile;
}

const EMAIL_PREFS_STORAGE_KEY  = 'cm_email_preferences';
const VOICE_SETTINGS_STORAGE_KEY = 'cm_voice_settings';

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
    DecimalPipe,
    RouterLink,
    ReactiveFormsModule,
    SubjectPerformanceCardComponent,
    XpStreakWidgetComponent,
    BadgeGridComponent,
    BadgeEarnedCardComponent,
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

  // ── Permissions tab: request-a-permission (selfView only) ────────────────
  requestablePermissions: RequestablePermissionGroup[] = [];
  myPermissionRequests: PermissionRequest[] = [];
  permissionRequestsLoading = false;
  private permissionRequestsFetched = false;

  // ── Settings tab ────────────────────────────────────────────────────────
  passwordForm: FormGroup;
  passwordHideCurrent = true;
  passwordHideNew     = true;
  passwordSaving      = false;
  showChangePasswordModal = false;

  // ── Voice & Audio settings ───────────────────────────────────────────────
  availableVoices: SpeechSynthesisVoice[] = [];
  voiceSettings: VoiceSettings = { voiceURI: '', rate: 1.0, pitch: 1.0, volume: 1.0, profile: 'neutral' };

  // ── Email preferences ────────────────────────────────────────────────────
  emailPrefSaving = false;

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
    private speechSrv: SpeechService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public dialog: MatDialog,
    private permissionsService: permissionsService,
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
    this.loadVoiceSettings();
    this.loadVoices();
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
    if (tab === 'permissions' && this.selfView && !this.permissionRequestsFetched) {
      this.loadPermissionRequestData();
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

  // ── Permissions tab: request-a-permission (selfView only) ────────────────

  private loadPermissionRequestData(): void {
    this.permissionRequestsFetched = true;
    this.permissionRequestsLoading = true;
    this.permissionsService.getRequestablePermissions().subscribe({
      next: (groups) => {
        this.requestablePermissions = groups ?? [];
        this.permissionRequestsLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.permissionRequestsLoading = false;
      },
    });
    this.permissionsService.getMyRequests().subscribe({
      next: (requests) => { this.myPermissionRequests = requests ?? []; },
      error: (err) => console.error(err),
    });
  }

  requestPermission(perm: RequestablePermission): void {
    const dialogRef = this.dialog.open(RequestPermissionDialogComponent, {
      width: '400px',
      minWidth: '320px',
      autoFocus: false,
      disableClose: true,
      data: { permission: perm },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        perm.requestPending = true;
        if (result.data) {
          this.myPermissionRequests = [result.data, ...this.myPermissionRequests];
        }
        this.showNotification('snackbar-success', 'Request submitted for review.', 'bottom', 'center');
      }
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
    // changeUserPassword() hits the established `users/creds/update` endpoint.
    this.authService.changeUserPassword(this.authData.token, { currentPassword, newPassword }).subscribe({
      next: (res) => {
        this.passwordSaving = false;
        if (res && !res.error) {
          this.showNotification('snackbar-success', 'Password updated successfully.', 'bottom', 'center');
          this.passwordForm.reset();
          this.showChangePasswordModal = false;
        } else {
          this.showNotification('snackbar-danger', res?.message || 'Incorrect current password or server error.', 'bottom', 'center');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.passwordSaving = false;
        const msg = err.status === 400
          ? 'Incorrect current password.'
          : err.status === 0
          ? 'Network error — please check your connection.'
          : 'Could not update password. Please try again.';
        this.showNotification('snackbar-danger', msg, 'bottom', 'center');
      },
    });
  }

  // ── Settings: Voice & Audio ─────────────────────────────────────────────
  private loadVoices(): void {
    const populate = () => {
      this.availableVoices = this.speechSrv.getVoices()
        .filter(v => v.lang.toLowerCase().startsWith('en'))
        .sort((a, b) => (b.localService ? 1 : 0) - (a.localService ? 1 : 0));
      if (!this.voiceSettings.voiceURI && this.availableVoices.length > 0) {
        this.voiceSettings.voiceURI = this.availableVoices[0].voiceURI;
      }
    };
    if (window.speechSynthesis.getVoices().length > 0) {
      populate();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', populate, { once: true });
    }
  }

  onVoiceChange(event: Event): void {
    this.voiceSettings.voiceURI = (event.target as HTMLSelectElement).value;
  }

  onRateChange(event: Event): void {
    this.voiceSettings.rate = +(event.target as HTMLInputElement).value;
  }

  onPitchChange(event: Event): void {
    this.voiceSettings.pitch = +(event.target as HTMLInputElement).value;
  }

  onVolumeChange(event: Event): void {
    this.voiceSettings.volume = +(event.target as HTMLInputElement).value;
  }

  applyVoiceProfile(profile: SpeechProfile): void {
    const presets: Record<SpeechProfile, { rate: number; pitch: number; volume: number }> = {
      neutral:  { rate: 1.0,  pitch: 1.0,  volume: 1.0 },
      cheerful: { rate: 1.05, pitch: 1.15, volume: 1.0 },
      calm:     { rate: 0.9,  pitch: 0.95, volume: 0.9 },
    };
    const p = presets[profile];
    this.voiceSettings = { ...this.voiceSettings, profile, rate: p.rate, pitch: p.pitch, volume: p.volume };
  }

  testVoice(): void {
    const voice = this.availableVoices.find(v => v.voiceURI === this.voiceSettings.voiceURI) ?? null;
    this.speechSrv.speak('Hello! This is a preview of your selected voice and audio settings on CodeMerit.', {
      rate: this.voiceSettings.rate,
      pitch: this.voiceSettings.pitch,
      volume: this.voiceSettings.volume,
      voice,
    });
  }

  saveVoiceSettings(): void {
    localStorage.setItem(VOICE_SETTINGS_STORAGE_KEY, JSON.stringify(this.voiceSettings));
    const voice = this.availableVoices.find(v => v.voiceURI === this.voiceSettings.voiceURI) ?? null;
    this.speechSrv.setVoice(voice);
    this.showNotification('snackbar-success', 'Voice preferences saved.', 'bottom', 'center');
  }

  private loadVoiceSettings(): void {
    try {
      const raw = localStorage.getItem(VOICE_SETTINGS_STORAGE_KEY);
      if (!raw) return;
      this.voiceSettings = { ...this.voiceSettings, ...JSON.parse(raw) };
    } catch { /* ignore malformed data */ }
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
    this.persistEmailPrefsLocally();
  }

  saveEmailPreferences(): void {
    if (this.emailPrefSaving) return;
    this.emailPrefSaving = true;
    this.persistEmailPrefsLocally();
    // No backend endpoint yet — simulated network call. Swap `of(true).pipe(delay(900))`
    // for a real HTTP call (e.g. authService.saveNotificationPrefs(...)) when the
    // endpoint is ready.
    of(true).pipe(delay(900)).subscribe(() => {
      this.emailPrefSaving = false;
      this.showNotification('snackbar-success', 'Email preferences saved.', 'bottom', 'center');
    });
  }

  private persistEmailPrefsLocally(): void {
    const toSave: Record<string, boolean> = {};
    this.emailPreferences.forEach((p) => { toSave[p.key] = p.enabled; });
    localStorage.setItem(EMAIL_PREFS_STORAGE_KEY, JSON.stringify(toSave));
  }
}
