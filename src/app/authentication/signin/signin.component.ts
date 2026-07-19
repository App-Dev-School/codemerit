import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService, Role } from '@core';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { SocialAuthService } from '@core/service/social-auth.service';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { ParticleCanvasComponent } from '@shared/components/particle-canvas/particle-canvas.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, ParticleCanvasComponent],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent extends UnsubscribeOnDestroyAdapter implements OnInit {

  authForm!: UntypedFormGroup;
  submitted = false;
  loading   = false;
  error     = '';
  hide      = true;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private master: MasterService,
    private router: Router,
    public  route: ActivatedRoute,
    private authService: AuthService,
    private snackbar: SnackbarService,
    private socialAuth: SocialAuthService,
  ) { super(); }

  ngOnInit() {
    this.authForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    if (!environment.production) {
      this.authForm.get('username')?.setValue('carolinjoannasheryl@gmail.com');
      this.authForm.get('password')?.setValue('180099');
    }
  }

  get f() { return this.authForm.controls; }

  onSubmit() {
    this.error = '';
    if (this.authForm.invalid) {
      this.error = 'Please enter a valid email and password.';
      return;
    }
    this.submitted = true;
    this.loading   = true;
    const payload = {
      email:    this.f['username'].value,
      password: this.f['password'].value,
    };
    this.subs.sink = this.authService.login(payload).subscribe({
      next: (res) => {
        if (res && !res.error && res.data) {
          setTimeout(() => this.routeAfterLogin(), 1000);
        } else {
          this.error     = 'Invalid credentials. Please try again.';
          this.submitted = false;
          this.loading   = false;
        }
      },
      error: (err) => {
        this.error     = err || 'Login failed. Please try again.';
        this.submitted = false;
        this.loading   = false;
      },
    });
  }

  navigateToRegister() { this.router.navigate(['/authentication/register']); }

  // ─── Social sign-in (Google / LinkedIn) ─────────────────────────

  connectWith(provider: 'Google' | 'LinkedIn') {
    this.error = '';
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
      .catch(() => {
        this.loading = false;
        this.error = 'Unable to load Google login. Please try again.';
      });
  }

  private handleGoogleCredential(idToken: string) {
    if (!idToken) {
      this.loading = false;
      this.error = 'Google did not return a login token.';
      return;
    }
    this.authService.completeGoogleSocialLogin({ idToken }).subscribe({
      next: (res) => this.finishSocialLogin(res),
      error: () => {
        this.loading = false;
        this.error = 'Unable to complete Google login. Please try again.';
      },
    });
  }

  private openLinkedinPopup() {
    this.loading = true;
    const result = this.socialAuth.startLinkedinLogin(
      (code) => this.handleLinkedinCode(code),
      (message) => {
        this.loading = false;
        if (message) this.error = message;
      },
    );

    if (result === 'not-configured') {
      this.loading = false;
      this.error = 'LinkedIn login is not configured yet.';
    } else if (result === 'popup-blocked') {
      this.loading = false;
      this.error = 'Please allow popups to continue with LinkedIn.';
    }
  }

  private handleLinkedinCode(code: string) {
    this.authService.completeLinkedinSocialLogin({
      code,
      redirectUri: this.socialAuth.linkedinRedirectUri,
    }).subscribe({
      next: (res) => this.finishSocialLogin(res),
      error: () => {
        this.loading = false;
        this.error = 'Unable to complete LinkedIn login. Please try again.';
      },
    });
  }

  private finishSocialLogin(res: any) {
    const userData = res?.data ?? res?.user;
    if (!userData?.id) {
      this.loading = false;
      this.snackbar.display('snackbar-dark', "We couldn't find an account for that login. Let's get you set up.", 'bottom', 'center');
      this.router.navigate(['/authentication/register']);
      return;
    }

    this.authService.setLocalData(userData);
    this.routeAfterLogin();
  }

  private routeAfterLogin() {
    const redirectUrl = localStorage.getItem(AuthConstants.REDIRECT_URL);
    if (redirectUrl) {
      localStorage.removeItem(AuthConstants.REDIRECT_URL);
      this.router.navigateByUrl(redirectUrl);
      this.loading = false;
      this.master.fetchMasterDataFromAPI().subscribe();
      return;
    }
    const role = this.authService.currentUserValue.role;
    if (role === Role.All || role === Role.Admin) {
      this.router.navigate(['/admin/dashboard/main']);
    } else if (role === Role.Subscriber || role === Role.Manager) {
      this.authService.getUserJobRoles()?.length > 0
        ? this.router.navigate(['/dashboard'])
        : this.router.navigate(['/select-job-role']);
    }
    this.loading = false;
    this.master.fetchMasterDataFromAPI().subscribe();
  }
}
