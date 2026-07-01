import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService, Role } from '@core';
import { MasterService } from '@core/service/master.service';
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
          setTimeout(() => {
            const redirectUrl = localStorage.getItem(AuthConstants.REDIRECT_URL);
            if (redirectUrl) {
              localStorage.removeItem(AuthConstants.REDIRECT_URL);
              this.router.navigateByUrl(redirectUrl);
              this.loading = false;
              this.master.fetchMasterDataFromAPI();
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
            this.master.fetchMasterDataFromAPI();
          }, 1000);
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
}
