import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService, Role } from '@core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OtpInputComponent } from '@shared/components/otp-input/otp-input.component';
@Component({
  selector: 'app-locked',
  templateUrl: './locked.component.html',
  styleUrls: ['./locked.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink,
    OtpInputComponent
  ]
})
export class LockedComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  error = '';
  userImg: string = 'assets/images/users/user.jpg';
  userFullName!: string;
  hide = true;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    super();
  }
  ngOnInit() {
    console.log("Verify Comp :: currentUserValue", this.authService.currentUserValue);
    this.authForm = this.formBuilder.group({
        password: ['', [Validators.required, Validators.minLength(6)]],
      });
    if (this.authService.currentUserValue && this.authService.currentUserValue?.accountStatus == "PENDING") {
      if (this.authService.currentUserValue.userImage) {
        this.userImg = this.authService.currentUserValue.userImage;
      }
      this.userFullName =
        this.authService.currentUserValue.firstName +
        ' ' +
        this.authService.currentUserValue.lastName;
    } else {
      //this.authService.redirectToLogin();
    }
  }
  get f() {
    return this.authForm.controls;
  }

  onSubmit() {
    if (this.authForm.invalid) {
      return;
    } else {
      this.submitted = true;
      const payload = {
        email: this.authService.currentUserValue.email,
        otp: this.f['password'].value,
        tag: "ACC_VERIFY"
      }
      this.subs.sink = this.authService
        .verifyAccount(payload)
        .subscribe({
          next: (res) => {
            console.log("VerifyAccount #1 API responded ", res);
            if (res && !res.error && res.data) {
              setTimeout(() => {
                console.log("VerifyAccount #2 User dashboard redirection ", res.data.role);
                this.navigate();
              }, 1000);
            } else {
              this.error = 'Invalid Login';
            }
          },
          error: (error) => {
            this.error = error;
            this.submitted = false;
          },
        });
    }
  }

  onOtpCompleted(otp: string) { this.authForm.patchValue({ password: otp }); }
  
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
