import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService, User } from '@core';
import { Country } from '@core/models/country.data';
import { InitialRole } from '@core/models/initial-role.data';
import { Status } from '@core/models/status.enum';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { map, Observable, of, startWith } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login-form',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    MatButton,
    MatAutocompleteModule
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})
export class LoginFormComponent {
  @Output() onSignUp = new EventEmitter<any>();
  authData: User;
  authForm!: UntypedFormGroup;
  options: InitialRole[] = AuthConstants.CURRENT_ROLE_OPTIONS;
  filteredOptions?: Observable<InitialRole[]>;
  countries?: Country[];
  filteredCountries?: Observable<Country[]>;
  submitted = false;
  error = "";

  constructor(
    private formBuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<LoginFormComponent>,
    private snackbar: SnackbarService,
    public authService: AuthService,
    private masterService: MasterService
  ) {
  }

  ngOnInit() {
    this.authForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(20)]],
      lastName: ['', [Validators.maxLength(20)]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      mobile: [''],
      city: [''],
      country: ['', Validators.required],
      about: ['', Validators.required],
      stars: [''],
    });
    if (environment) {
      //this.authForm.get('city')?.setValue('Bengaluru');
      this.authForm.get('country')?.setValue('India');
      this.authForm.get('about')?.setValue('IT Fresher (Graduate)');
    }
    this.filteredOptions = of(this.options);
    this.filteredOptions = this.authForm.get('about').valueChanges.pipe(
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
      this.submitted = false;
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
        country: this.authForm.get('country')?.value,
        about: this.authForm.get('about')?.value,
        flow: this.data ? "QuickRegistration" : "Registration"
      };

      
      this.authService.register(postData).subscribe((res) => {
        //dismiss this dialog
        this.onSignUp.emit(res);
        if(res && res.data && res.data.id){
          this.authService.setLocalData(res.data);
        }
        if(this.data){
          this.dismiss(res.data);
        }
      },
        (error) => {
          this.error = error;
          this.submitted = false;
          this.error = "Error connecting to server. Please try again.";
          this.snackbar.display("snackbar-danger", this.error, "bottom", "center");
          //dismiss this dialog
          this.onSignUp.emit(null);
          if(this.data){
          this.dismiss(null);
        }
        }
      );
    }
  }

  dismiss(data:any){
    this.dialogRef.close(data);
  }
}
