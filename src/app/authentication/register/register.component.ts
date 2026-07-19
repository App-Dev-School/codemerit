import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/service/auth.service';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { SocialAuthService } from '@core/service/social-auth.service';
import { ParticleCanvasComponent } from '@shared/components/particle-canvas/particle-canvas.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ParticleCanvasComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private masterService: MasterService,
    private snackbar: SnackbarService,
    private socialAuth: SocialAuthService,
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
    this.loading = true;
    this.socialAuth
      .promptGoogleLogin(
        (idToken) => this.handleGoogleCredential(idToken),
        () => { this.loading = false; },
      )
      .catch(() => this.failSocialLogin('Unable to load Google login. Please try again.'));
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
    this.loading = true;
    const result = this.socialAuth.startLinkedinLogin(
      (code) => this.handleLinkedinCode(code),
      (message) => {
        this.loading = false;
        if (message) {
          this.snackbar.display('snackbar-danger', message, 'bottom', 'center');
        }
      },
    );

    if (result === 'not-configured') {
      this.failSocialLogin('LinkedIn login is not configured yet.');
    } else if (result === 'popup-blocked') {
      this.failSocialLogin('Please allow popups to continue with LinkedIn.');
    }
  }

  private handleLinkedinCode(code: string) {
    this.authService.completeLinkedinSocialLogin({
      code,
      redirectUri: this.socialAuth.linkedinRedirectUri,
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
