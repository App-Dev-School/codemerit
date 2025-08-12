import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService, Role } from '@core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
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
        RouterLink,
    ]
})
export class LockedComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  userImg!: string;
  userFullName!: string;
  hide = true;
  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // constuctor
  }
  ngOnInit() {
    console.log("Verify Comp :: currentUserValue", this.authService.currentUserValue);
    if(this.authService.currentUserValue && this.authService.currentUserValue?.accountStatus == "PENDING"){
          this.authForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.maxLength(6)]],
    });
    this.userImg = this.authService.currentUserValue.userImage;
    if(!this.userImg){
      this.userImg = 'assets/images/users/user.jpg';
    }
    this.userFullName =
      this.authService.currentUserValue.firstName +
      ' ' +
      this.authService.currentUserValue.lastName;
    }else{
    this.authService.redirectToLogin();
    }
  }
  get f() {
    return this.authForm.controls;
  }
  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.authForm.invalid) {
      return;
    } else {
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
}
