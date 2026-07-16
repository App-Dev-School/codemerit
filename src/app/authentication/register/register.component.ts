import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/service/auth.service';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { ParticleCanvasComponent } from '@shared/components/particle-canvas/particle-canvas.component';
import { environment } from 'src/environments/environment';

declare global {
  interface Window {
    google?: any;
  }
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ParticleCanvasComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy {

  currentStep = 1;
  readonly totalSteps = 3;
  highestStepReached = 1;
  loading = false;
  success = false;

  form!: FormGroup;

  masteryLabel = 'Beginner';
  masteryLabelClass = 'mastery-val mastery-val--beginner';

  readonly steps = [
    { label: 'Career Goal' },
    { label: 'Your Skills' },
    { label: 'Create Account' },
  ];

  readonly techData: Record<string, string[]> = {
    frontend:  ['Web Designer - 1', 'Web Programmer', 'JavaScript Developer', 'React / Vue Specialist', 'UI Engineer', 'Frontend Architect'],
    backend:   ['Node API Developer', 'Backend Engineer - 1', 'Backend Engineer - 2', 'Java / Spring Boot Developer', 'Python / Django Developer', 'Go Microservices Engineer'],
    fullstack: ['MERN Stack Developer', 'MEAN Stack Developer', 'Full-Stack Engineer - 1', 'Full-Stack Web App Developer'],
    aiml:      ['Data Scientist - 1', 'Machine Learning Engineer', 'NLP Specialist', 'Computer Vision Engineer', 'AI Researcher'],
    data:      ['Data Engineer - 1', 'Big Data Architect', 'Database Administrator (DBA)', 'Analytics Engineer'],
    devops:    ['Cloud Architect', 'Site Reliability Engineer (SRE)', 'DevOps Engineer - 1', 'Release Manager', 'Kubernetes Administrator'],
    gamedev:   ['Unity Developer', 'Unreal Engine C++ Dev', 'Gameplay Programmer', 'Technical Artist'],
    mobile:    ['iOS / Swift Developer', 'Android / Kotlin Developer', 'React Native Specialist', 'Flutter Engineer'],
  };

  availableTracks: any[] = [];
  private linkedInPopup: Window | null = null;
  private readonly socialMessageHandler = (event: MessageEvent) => this.handleSocialMessage(event);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private masterService: MasterService,
    private snackbar: SnackbarService,
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      techArea:        ['', Validators.required],
      track:           [{ value: '', disabled: true }, Validators.required],
      dreamRole:       [''],
      masteryLevel:    [25],
      yearsExperience: [null],
      achievement:     [''],
      firstName:       ['', [Validators.required, Validators.maxLength(20)]],
      lastName:        ['', Validators.maxLength(20)],
      email:           ['', [Validators.required, Validators.email]],
    });
    window.addEventListener('message', this.socialMessageHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('message', this.socialMessageHandler);
  }

  // ─── Computed helpers ──────────────────────────────────────────

  get progressWidth(): number {
    return ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
  }

  isCompleted(step: number): boolean { return step < this.currentStep; }
  isActive(step: number):    boolean { return step === this.currentStep; }
  isReachable(step: number): boolean { return step <= this.highestStepReached; }

  stepBtnClass(step: number): string {
    if (this.isCompleted(step)) return 'step-btn step-btn--done';
    if (this.isActive(step))    return 'step-btn step-btn--active';
    return 'step-btn step-btn--pending';
  }

  stepTextClass(step: number): string {
    if (this.isCompleted(step)) return 'step-label step-label--done';
    if (this.isActive(step))    return 'step-label step-label--active';
    return 'step-label step-label--pending';
  }

  trackValue(track: any): string {
    return track?.id || '';
  }

  get jobRoles(): any[] {
    return this.masterService.jobRoles || [];
  }

  // ─── Form interactions ─────────────────────────────────────────

  onTechAreaChange() {
    const jobRoleId = Number(this.form.get('techArea')!.value);
    const selectedRole = this.jobRoles.find((role: any) => Number(role.id) === jobRoleId);
    const trackCtrl = this.form.get('track')!;
    trackCtrl.setValue('');
    trackCtrl.disable();
    this.availableTracks = [];

    if (!selectedRole?.slug) {
      return;
    }

    this.masterService.fetchCourseDetail(selectedRole.slug).subscribe((data: any) => {
      this.availableTracks = (data?.certificationTracks || [])
        .slice()
        .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

      this.availableTracks.length ? trackCtrl.enable() : trackCtrl.disable();
    });
  }

  onMasteryInput(event: Event) {
    const val = +(event.target as HTMLInputElement).value;
    this.form.get('masteryLevel')!.setValue(val);
    if (val < 33)      { this.masteryLabel = 'Beginner';     this.masteryLabelClass = 'mastery-val mastery-val--beginner'; }
    else if (val < 66) { this.masteryLabel = 'Intermediate'; this.masteryLabelClass = 'mastery-val mastery-val--mid'; }
    else               { this.masteryLabel = 'Advanced';     this.masteryLabelClass = 'mastery-val mastery-val--advanced'; }
  }

  // ─── Stepper navigation ────────────────────────────────────────

  nextStep() {
    if (this.currentStep === 1) {
      const techArea = this.form.get('techArea')!.value;
      const track    = this.form.get('track')!.value;
      if (!techArea || !track) {
        this.snackbar.display('snackbar-danger', 'Please select a career area and certification target to continue.', 'bottom', 'center');
        return;
      }
    }
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      if (this.currentStep > this.highestStepReached) this.highestStepReached = this.currentStep;
    }
  }

  prevStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  goToStep(step: number) {
    if (this.isReachable(step)) this.currentStep = step;
  }

  // ─── Account connect (Step 3) ───────────────────────────────────

  connectWith(provider: 'Google' | 'LinkedIn') {
    if (provider === 'Google') {
      this.openGoogleLogin();
      return;
    }

    this.openLinkedinPopup();
  }

  private openGoogleLogin() {
    const clientId = environment.socialAuth?.googleClientId;
    if (!clientId) {
      this.failSocialLogin('Google login is not configured yet.');
      return;
    }

    this.loading = true;
    this.loadGoogleSdk()
      .then(() => {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => this.handleGoogleCredential(response?.credential),
        });
        window.google.accounts.id.prompt((notification: any) => {
          if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
            this.loading = false;
          }
        });
      })
      .catch(() => this.failSocialLogin('Unable to load Google login. Please try again.'));
  }

  private loadGoogleSdk(): Promise<void> {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }

  private handleGoogleCredential(idToken: string) {
    if (!idToken) {
      this.failSocialLogin('Google did not return a login token.');
      return;
    }

    this.authService.completeGoogleSocialLogin({ idToken }).subscribe({
      next: (res) => this.finishSocialLogin(res, 'google'),
      error: () => this.failSocialLogin('Unable to complete Google login. Please try again.'),
    });
  }

  private openLinkedinPopup() {
    const clientId = environment.socialAuth?.linkedinClientId;
    if (!clientId) {
      this.failSocialLogin('LinkedIn login is not configured yet.');
      return;
    }

    const redirectUri = this.socialRedirectUri;
    const state = this.createSocialState();
    const scope = encodeURIComponent(environment.socialAuth?.linkedinScope || 'openid profile email');
    const params = [
      `response_type=code`,
      `client_id=${encodeURIComponent(clientId)}`,
      `redirect_uri=${encodeURIComponent(redirectUri)}`,
      `state=${encodeURIComponent(state)}`,
      `scope=${scope}`,
    ].join('&');
    const url = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
    const width = 560;
    const height = 680;
    const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
    const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

    this.loading = true;
    this.linkedInPopup = window.open(
      url,
      'linkedin-login',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!this.linkedInPopup) {
      this.failSocialLogin('Please allow popups to continue with LinkedIn.');
    }
  }

  private handleSocialMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin || event.data?.type !== 'SOCIAL_AUTH_CALLBACK') {
      return;
    }

    if (event.data.status !== 'success' || !event.data.code) {
      this.failSocialLogin('LinkedIn sign-in was cancelled or failed.');
      return;
    }

    this.authService.completeLinkedinSocialLogin({
      code: event.data.code,
      redirectUri: this.socialRedirectUri,
    }).subscribe({
      next: (res) => this.finishSocialLogin(res, 'linkedin'),
      error: () => this.failSocialLogin('Unable to complete LinkedIn login. Please try again.'),
    });
  }

  private finishSocialLogin(res: any, provider: 'google' | 'linkedin') {
    const userData = res?.data ?? res?.user;
    if (userData?.id) {
      this.authService.setLocalData(userData);
      this.loading = false;
      this.snackbar.display('snackbar-success', 'Account connected successfully.', 'bottom', 'center');
      this.routeAfterSocialLogin();
      return;
    }

    const socialToken = res?.socialToken ?? res?.data?.socialToken;
    if (!socialToken) {
      this.failSocialLogin('Unable to verify your social account. Please try again.');
      return;
    }

    this.authService.completeSocialRegistration({
      socialToken,
      provider,
      onboarding: this.buildOnboardingPayload(),
    }).subscribe({
      next: (completeRes) => {
        const completeUser = completeRes?.data ?? completeRes?.user ?? completeRes;
        if (completeUser?.id) {
          this.authService.setLocalData(completeUser);
          this.loading = false;
          this.snackbar.display('snackbar-success', 'Account connected successfully.', 'bottom', 'center');
          this.routeAfterSocialLogin();
          return;
        }
        this.failSocialLogin('Unable to create your account. Please try again.');
      },
      error: () => this.failSocialLogin('Unable to create your account. Please try again.'),
    });
  }

  private routeAfterSocialLogin() {
    this.authService.getUserJobRoles()?.length > 0
      ? this.router.navigate(['/dashboard'])
      : this.router.navigate(['/select-job-role']);
  }

  private buildOnboardingPayload() {
    const v = this.form.getRawValue();
    const selectedRole = this.jobRoles.find((role: any) => Number(role.id) === Number(v.techArea));
    const selectedTrack = this.availableTracks.find((track: any) => Number(track.id) === Number(v.track));

    return {
      firstName: v.firstName,
      lastName: v.lastName || '',
      email: v.email,
      mobile: null,
      city: null,
      country: 'India',
      about: v.achievement || '',
      techArea: selectedRole?.title || v.techArea,
      techRoleId: v.techArea,
      certificationTrackId: v.track,
      track: selectedTrack?.title || '',
      dreamRole: v.dreamRole,
      masteryLevel: v.masteryLevel,
      yearsExperience: v.yearsExperience,
      achievement: v.achievement,
      flow: 'Registration',
    };
  }

  private get socialRedirectUri(): string {
    return `${window.location.origin}/authentication/social-callback`;
  }

  private createSocialState(): string {
    const values = new Uint32Array(4);
    window.crypto.getRandomValues(values);
    return Array.from(values).map((value) => value.toString(16)).join('');
  }

  private failSocialLogin(message: string) {
    this.loading = false;
    this.snackbar.display('snackbar-danger', message, 'bottom', 'center');
    this.router.navigate(['/authentication/social-failed']);
  }

  // ─── Submit (manual fallback) ────────────────────────────────────

  onSubmit() {
    const firstName = this.form.get('firstName')!;
    const email     = this.form.get('email')!;
    if (firstName.invalid || email.invalid) {
      this.snackbar.display('snackbar-danger', 'Please fill all required fields correctly.', 'bottom', 'center');
      return;
    }
    this.loading = true;
    const v = this.form.getRawValue();
    const selectedRole = this.jobRoles.find((role: any) => Number(role.id) === Number(v.techArea));
    const selectedTrack = this.availableTracks.find((track: any) => Number(track.id) === Number(v.track));

    const postData = {
      firstName:             v.firstName,
      lastName:              v.lastName || '',
      email:                 v.email,
      mobile:                null,
      city:                  null,
      country:               'India',
      about:                 v.achievement || '',
      techArea:              selectedRole?.title || v.techArea,
      techRoleId:            v.techArea,
      certificationTrackId:  v.track,
      track:                 selectedTrack?.title || '',
      dreamRole:             v.dreamRole,
      masteryLevel:          v.masteryLevel,
      yearsExperience:       v.yearsExperience,
      achievement:           v.achievement,
      flow:                  'Registration',
    };

    this.authService.register(postData).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.data && res.data.id) {
          this.authService.setLocalData(res.data);
        }
        this.success = true;
        setTimeout(() => this.router.navigate(['/authentication/verify']), 3000);
      },
      error: () => {
        this.loading = false;
        this.snackbar.display('snackbar-danger', 'Error connecting to server. Please try again.', 'bottom', 'center');
      },
    });
  }

}
