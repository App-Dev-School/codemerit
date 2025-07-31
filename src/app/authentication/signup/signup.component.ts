import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { SnackbarService } from '@core/service/snackbar.service';
import { AuthService } from '@core/service/auth.service';
import { AuthConstants } from '@config/AuthConstants';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    MatAutocompleteModule,
    RouterLink,
    MatButtonModule,
    AsyncPipe
  ]
})
export class SignupComponent implements OnInit, OnDestroy {
  authForm!: UntypedFormGroup;
  options: string[] = ['Pursuing B.E/B.Tech', 'IT Fresher', 'IT Programmer (0-2 Yrs)' ,'Experienced IT Professional'];
  filteredOptions?: Observable<string[]>;
  submitted = false;
  error = "";
  returnUrl!: string;
  timeOutIDs: any[] = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: SnackbarService,
    public authService: AuthService
  ) { }
  ngOnInit() {
    this.authForm = this.formBuilder.group({
      name: ['Test Doe', Validators.required],
      email: [
        'test@gma.com',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      mobile: [''],
      city: ['Bengaluru', Validators.required],
      designation: ['IT Programmer', Validators.required]
    });
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.filteredOptions = this.authForm.valueChanges.pipe(
      startWith(''),
      map((name) => (name ? this._filter(name) : this.options.slice()))
    );
  }
  get f() {
    return this.authForm.controls;
  }
  displayFn(user: string): string {
    return user;
  }
  private _filter(name: string): string[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(
      (option) => option.toLowerCase().indexOf(filterValue) === 0
    );
  }
  onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.authForm.invalid) {
      return;
    } else {
      //this.router.navigate(['/admin/dashboard/main']);
      const fullName = this.authForm.get('name')?.value;
      let postData = {
        firstName: this.authForm.get('name')?.value,
        lastName: "",
        email: this.authForm.get('email')?.value,
        mobile: this.authForm.get('mobile')?.value,
        city: this.authForm.get('city')?.value,
        designation: this.authForm.get('designation')?.value.name
      };

      this.authService.register(postData).subscribe((res) => {
        this.submitted = false;
        if (res) {
          if (AuthConstants.DEV_MODE) {
            console.log("/******* Signup APIResponse => " + JSON.stringify(res));
          }
          if (!res.error) {
            if (res.data) {
              //this.authService.setAuthData(res.userData);
              // let serverDelay = setTimeout(() => {
              //   this.authService.navigateAfterLogin();
              // }, 3000)
              // this.timeOutIDs.push(serverDelay);
              this.router.navigate(['/admin/dashboard/main']);
            }
          } else {
            if (res.message) {
              this.snackbar.display("snackbar-danger", res.message, "bottom", "center");
            }
          }
        } else {
          this.error = "Server Error. Please check your connection and try again.";
          this.snackbar.display("snackbar-danger", this.error, "bottom", "center");
        }
      },
        (error) => {
          this.error = error;
          this.submitted = false;
          this.error = "Error connecting to server. Please try again.";
          this.snackbar.display("snackbar-danger", this.error, "bottom", "center");
        }
      );
    }
  }

  ngOnDestroy() {
    this.timeOutIDs.forEach(id => clearTimeout(id));
  }
}
