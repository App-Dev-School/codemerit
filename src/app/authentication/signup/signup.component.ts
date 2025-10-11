import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { User } from '@core';
import { Status } from '@core/models/status.enum';
import { AuthService } from '@core/service/auth.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { LoginFormComponent } from '@shared/components/login-form/login-form.component';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    RouterLink,
    MatButtonModule,
    LoginFormComponent,
    AsyncPipe
  ]
})
export class SignupComponent implements OnInit, OnDestroy {
  authData: User;
  error = "";
  returnUrl!: string;
  timeOutIDs: any[] = [];

  constructor(
    private router: Router,
    private snackbar: SnackbarService,
    public authService: AuthService
  ) {
  }

  ngOnInit() {
    this.authData = this.authService.currentUserValue;
    this.authService.currentUser.subscribe((res) => {
      if (res) {
        console.log("SignUp OnCurrentUseChange", res);
        console.log("OnCurrentUseChange old ::authData::", this.authData);
        //this.router.navigate(['/authentication/signin']);
        if (res && res.token && res.accountStatus === Status.Active) {
          //this.authService.redirectToDashboard();  
          this.snackbar.display("snackbar-danger", "Taking to your Dashboard.", "bottom", "center");
        }
      }
    });

    if (this.authData.token && this.authData.firstName && this.authData.id) {
      this.authService.logout("Sign Up").subscribe((res) => {
        if (res) {
          console.log("Logged out :: authData", this.authData);
          //this.router.navigate(['/authentication/signin']);
          this.snackbar.display("snackbar-danger", "Logged you out! Please login again.", "bottom", "center");
        }
      });
    }
  }

  onLoginFormSubmitted(loginResponse: any) {
    if (loginResponse) {
      if (!loginResponse.error) {
        if (loginResponse.data) {
          //validate and use in verify
          this.authService.setLocalData(loginResponse.data);
          let serverDelay = setTimeout(() => {
            //Send all registration to verify page
            this.router.navigate(['/authentication/verify']);
          }, 3000)
          this.timeOutIDs.push(serverDelay);
          //this.router.navigate(['/admin/dashboard/main']);
        }
      } else {
        if (loginResponse.message) {
          this.snackbar.display("snackbar-danger", loginResponse.message, "bottom", "center");
        }
      }
    } else {
      this.error = "Error registering account. Please try again later.";
      this.snackbar.display("snackbar-danger", this.error, "bottom", "center");
    }
  }

  navigateToLogin() {
    this.router.navigate(['/authentication/signin']);
  }

  onLoginLink() {
    this.navigateToLogin();
  }

  ngOnDestroy() {
    this.timeOutIDs.forEach(id => clearTimeout(id));
  }
}
