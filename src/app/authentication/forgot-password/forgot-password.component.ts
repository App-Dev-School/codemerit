import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
  ]
})
export class ForgotPasswordComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService   // ✅ inject AuthService
  ) { }

  ngOnInit() {
    this.authForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
    });
  }

  get f() {
    return this.authForm.controls;
  }

  onSubmit() {
  this.submitted = true;
  if (this.authForm.invalid) {
    return;
  }

  const payload = {
    email: this.authForm.get('email')?.value,
    otp: this.authForm.get('otp')?.value,
    tag: "PWD_RECOVER",
    password: this.authForm.get('password')?.value
  };

  this.authService.forgotPassword(payload).subscribe({
    next: (res) => {
      alert("Password reset successful!");
      this.router.navigate(['/authentication/recover-password']);
    },
    error: (err) => {
      console.error("Forgot Password Error:", err);
      alert("Something went wrong, please try again.");
    }
  });
}
}