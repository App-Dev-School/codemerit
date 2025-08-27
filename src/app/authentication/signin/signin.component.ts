import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { AuthService, Role } from '@core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  imports: [
    RouterLink,
    //RouterModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ]
})
export class SigninComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  error = '';
  hide = true;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    super();
  }

  ngOnInit() {
    this.authForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    if (!environment.production) {
      this.authForm.get('username')?.setValue('admin@codemerit.com');
      this.authForm.get('password')?.setValue('756272');
    }
  }
  get f() {
    return this.authForm.controls;
  }

  onSubmit() {
    this.error = '';
    if (this.authForm.invalid) {
      this.error = 'Username and Password not valid !';
      return;
    } else {
      this.submitted = true;
      this.loading = true;
      const payload = {
        email: this.f['username'].value,
        password: this.f['password'].value
      }
      this.subs.sink = this.authService
        .login(payload)
        .subscribe({
          next: (res) => {
            if (res && !res.error && res.data) {
              setTimeout(() => {
                const role = this.authService.currentUserValue.role;
                if (role === Role.All || role === Role.Admin) {
                  this.router.navigate(['/admin/dashboard/main']);
                } else {
                  if (role === Role.Subscriber) {
                    this.router.navigate(['/dashboard/select-job-role']);
                  } else {
                    if (role === Role.Manager) {
                      this.router.navigate(['/dashboard?manage']);
                    } else {
                    }
                  }
                }
                this.loading = false;
              }, 1000);
            } else {
              this.error = 'Invalid Login';
            }
          },
          error: (error) => {
            this.error = error;
            this.submitted = false;
            this.loading = false;
          },
        });
    }
  }

  activateTestLogin() {
    this.authForm.get('username')?.setValue('user3@codemerit.com');
    this.authForm.get('password')?.setValue('605161');
  }

  activateTestUserLogin() {
    this.authForm.get('username')?.setValue('student@codemerit.com');
    this.authForm.get('password')?.setValue('788007');
  }

  connectWithGoogle() {
    console.log("connectWithGoogle => " + this.authService.currentUser);
  }

}
