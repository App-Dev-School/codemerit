import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, Role } from '@core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { OtpInputComponent } from '@shared/components/otp-input/otp-input.component';
import { ParticleCanvasComponent } from '@shared/components/particle-canvas/particle-canvas.component';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, OtpInputComponent, ParticleCanvasComponent],
  templateUrl: './locked.component.html',
  styleUrls: ['./locked.component.scss'],
})
export class VerifyAccountComponent extends UnsubscribeOnDestroyAdapter implements OnInit {

  authForm!: UntypedFormGroup;
  submitted   = false;
  verifying   = false;
  error       = '';
  pasteError  = '';
  userImg     = 'assets/images/users/user.jpg';
  userFullName!: string;
  userEmail!: string;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService,
  ) { super(); }

  ngOnInit() {
    const user = this.authService.currentUserValue;
    console.log('VerifyAccount :: currentUserValue', user);

    this.authForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    if (user?.accountStatus === 'PENDING') {
      if (user.userImage) this.userImg = user.userImage;
      this.userFullName = `${user.firstName} ${user.lastName}`.trim();
      this.userEmail    = user.email;
    } else {
      this.authService.redirectToLogin();
    }
  }

  get f() { return this.authForm.controls; }

  onOtpCompleted(otp: string) {
    this.authForm.patchValue({ password: otp });
  }

  async pasteFromClipboard() {
    this.pasteError = '';
    try {
      const text   = await navigator.clipboard.readText();
      const digits = text.replace(/\D/g, '').slice(0, 6);
      if (digits.length === 0) {
        this.pasteError = 'No digits found in clipboard';
        setTimeout(() => (this.pasteError = ''), 2500);
        return;
      }
      this.authForm.patchValue({ password: digits });
      // auto-submit when a full 6-digit OTP is pasted
      if (digits.length === 6) this.onSubmit();
    } catch {
      this.pasteError = 'Allow clipboard access to use this';
      setTimeout(() => (this.pasteError = ''), 2500);
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.authForm.invalid) return;

    this.verifying = true;
    this.error = '';
    const payload = {
      email: this.authService.currentUserValue.email,
      otp:   this.f['password'].value,
      tag:   'ACC_VERIFY',
    };

    this.subs.sink = this.authService.verifyAccount(payload).subscribe({
      next: (res) => {
        console.log('VerifyAccount API response', res);
        if (res && !res.error && res.data) {
          setTimeout(() => this.navigate(), 1000);
        } else {
          this.error     = res?.message || 'Invalid OTP. Please try again.';
          this.verifying = false;
          this.submitted = false;
        }
      },
      error: (err) => {
        this.error     = err || 'Verification failed. Please try again.';
        this.verifying = false;
        this.submitted = false;
      },
    });
  }

  navigate() {
    const role = this.authService.currentUserValue.role;
    if (role === Role.All || role === Role.Admin) {
      this.router.navigate(['/admin/dashboard/main']);
    } else if (role === Role.Subscriber) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/authentication/signin']);
    }
  }

}
