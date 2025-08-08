import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthConstants } from '@config/AuthConstants';
import { User } from '@core';
import { Country } from '@core/models/country.data';
import { InitialRole } from '@core/models/initial-role.data';
import { AuthService } from '@core/service/auth.service';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { environment } from 'src/environments/environment';
import { map, Observable, of, startWith } from 'rxjs';
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
  authData: User;
  authForm!: UntypedFormGroup;
  options: InitialRole[] = AuthConstants.CURRENT_ROLE_OPTIONS;
  filteredOptions?: Observable<InitialRole[]>;
  countries?: Country[];
  filteredCountries?: Observable<Country[]>;
  submitted = false;
  error = "";
  returnUrl!: string;
  timeOutIDs: any[] = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: SnackbarService,
    public authService: AuthService,
    private masterService: MasterService
  ) {
  }
  ngOnInit() {
    this.authData = this.authService.currentUserValue;
    if (this.authData.token && this.authData.firstName && this.authData.id) {
      this.authService.logout().subscribe((res) => {
        this.snackbar.display("snackbar-danger", "Logging you out! Please login again.", "bottom", "center");
        if (!res.success) {
          this.router.navigate(['/authentication/signin']);
        }
      });
    }
    this.authForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(20)]],
      lastName: ['', [Validators.maxLength(20)]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      mobile: [''],
      city: ['', Validators.required],
      country: ['', Validators.required],
      designation: ['', Validators.required]
    });
    if (!environment.production) {
      this.authForm.get('firstName')?.setValue('Test');
      this.authForm.get('email')?.setValue('user1@codemerit.com');
      this.authForm.get('city')?.setValue('Bengaluru');
      this.authForm.get('country')?.setValue('India');
      this.authForm.get('designation')?.setValue('IT Fresher (Graduate)');
    }
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    console.log("NgSignUp returnUrl", this.returnUrl);
    this.filteredOptions = of(this.options);
    this.filteredOptions = this.authForm.get('designation').valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.label || ''),
      map(name => this._filter(name))
    );

    this.masterService.getCountries().subscribe((countryData: any) => {
      this.countries = countryData;
      this.filteredCountries = this.authForm.get('country').valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value?.name || ''),
        map(name => this._filterCountry(name))
      );
    });
  }

  get f() {
    return this.authForm.controls;
  }

  /* Auto-complete functions */

  displayRole(role: string): string {
    return role;
  }

  private _filter(name: string): InitialRole[] {
    const filterValue = name.toLowerCase();
    return this.options.filter(
      (option) => option.label.toLowerCase().indexOf(filterValue) === 0
    );
  }

  displayCountry(country: string): string {
    return country;
  }

  private _filterCountry(name: string): Country[] {
    const filterValue = name.toLowerCase();
    return this.countries.filter(country =>
      country.name.toLowerCase().includes(filterValue)
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
        firstName: this.authForm.get('firstName')?.value,
        lastName: this.authForm.get('lastName')?.value,
        email: this.authForm.get('email')?.value,
        mobile: null,
        city: this.authForm.get('city')?.value,
        country: this.authForm.get('country')?.value.name,
        designation: this.authForm.get('designation')?.value,
        flow: "Registration"
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
