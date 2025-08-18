import { AsyncPipe, JsonPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthConstants } from '@config/AuthConstants';
import { User } from '@core';
import { Country } from '@core/models/country.data';
import { InitialRole } from '@core/models/initial-role.data';
import { AuthService } from '@core/service/auth.service';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { combineLatest, map, Observable, of, startWith } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MatCard, MatCardContent } from "@angular/material/card";
@Component({
  selector: 'app-create-user',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  imports: [
    BreadcrumbComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    AsyncPipe,
    MatCard, MatCardContent
]
})
export class CreateUserComponent implements OnInit, OnDestroy {
  constructor(private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private masterService: MasterService,
    private snackbar: SnackbarService,
    public authService: AuthService) {
  }
  authData : User;
  authForm!: UntypedFormGroup;
  userName = "";
  userDetail:any;
  loading = false;
  editMode = false;
  screenTitle = 'Add New User';
  screenAction = 'Register User';
  html = '';
  submitted = false;
  error = "";
  options: InitialRole[] = AuthConstants.CURRENT_ROLE_OPTIONS;
  filteredOptions?: Observable<InitialRole[]>;
  countries?: Country[];
  filteredCountries?: Observable<Country[]>;

  ngOnInit(): void {
    this.authData = this.authService.currentUserValue;
    this.takeRouteParams();
    this.authForm = this.formBuilder.group({
      firstName: ['Alex', Validators.required],
      lastName: ['Doe'],
      email: [
        'user@codemerit.com',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      mobile: [null, [Validators.minLength(9)]],
      city: ['Bengaluru', Validators.required],
      country: ['India', Validators.required],
      designation: ['IT Student', Validators.required],
      linkedinUrl: ['']
    });

    if (!environment.production) {
          this.authForm.get('firstName')?.setValue('Test');
          this.authForm.get('email')?.setValue('user1@codemerit.com');
          this.authForm.get('city')?.setValue('Bengaluru');
          this.authForm.get('country')?.setValue('India');
          this.authForm.get('designation')?.setValue('IT Fresher (Graduate)');
        }
    // this.editor = new Editor();
    this.filteredOptions = of(this.options);

    this.filteredOptions = this.authForm.get('designation').valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value?.label || ''),
        map(name => this._filter(name))
      );

    this.masterService.getCountries().subscribe((countryData: any) => {
      this.countries = countryData;
      //this.filteredCountries = of(countryData.map((country) => country.name));
      this.filteredCountries = this.authForm.get('country').valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value?.name || ''),
        map(name => this._filterCountry(name))
      );
    });
  }

  takeRouteParams(){
    console.log("takeRoute ===>", this.router.url);
    
    this.route.paramMap.subscribe(params => {
      console.log("takeRoute paramMap ===>", params);
      if(params.get("userName")){
      this.userName = params.get("userName");
      console.log("NgEditUser userName", this.userName);
      if(this.userName){
        this.editMode = true;
        this.screenTitle = 'Update User';
        this.screenAction = 'Update User';
        this.loadData();
       }
     }else{
      //Do redirect back
       //this.authService.redirectToErrorPage();
     }
    });
  }

  public loadData() {
    this.loading = true;
    if(this.userName){
          if(navigator.onLine){
            //fullProfiles.json getFullProfile
            console.log("NgEditUser userName", this.userName);
            this.authService.getFullProfile(this.userName, this.authData.token).subscribe(
              (data : any) => {
                console.log("NgViewUser Dummy API", data);
                this.loading = false;
                if(!data.error){
                  this.userDetail = data.data;
                  console.log("NgEditUser userDetail", this.userDetail);
                  if(this.userDetail == null || this.userDetail == undefined){
                    // this.noDataView = true;
                    //this.authService.redirectToErrorPage();
                  }
                }else{
                  //this.noDataView = true;
                  this.loading = false;
                  console.log("NgEditUser Dummy API Failure", data);
                }
              },
              (error: HttpErrorResponse) => {
                this.loading = false;
                //this.authService.redirectToErrorPage();
                console.log("NgEditUser API Error", error.name + " " + error.message);
              }
            );
          }else{
            this.snackbar.display("snackbar-danger", "Error loading user details.", "bottom", "center");
          }
        }
  }

  onSubmit() {
    this.submitted = true;
    if (this.authForm.invalid) {
      this.snackbar.display("snackbar-danger", "Please re-check your submission.", "bottom", "center");
      return;
    } else {
      let postData = {
        firstName: this.authForm.get('firstName')?.value,
        lastName: this.authForm.get('lastName')?.value,
        email: this.authForm.get('email')?.value,
        mobile: this.authForm.get('mobile')?.value,
        city: this.authForm.get('city')?.value,
        country: this.authForm.get('country')?.value,
        designation: this.authForm.get('designation')?.value,
         ...(this.authForm.get('linkedinUrl')?.value && { linkedinUrl: this.authForm.get('linkedinUrl')?.value })
      };
      let createUpdateCall : Observable<any>;
      if (this.editMode){
      createUpdateCall = this.authService.updateUserAccount(this.authData.token, this.userDetail.id, postData);
      }else{
      createUpdateCall = this.authService.register(postData);
      }
      createUpdateCall.subscribe((res) => {
        this.submitted = false;
        if (res) {
          if (!res.error && res.data) {
              this.router.navigate(['/users/list']).then(() => {
                this.snackbar.display("snackbar-success", "User account "+(this.editMode ? "updated" : "created")+" successfully.", "bottom", "center");
              });
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

  // make sure to destory the editor
  ngOnDestroy(): void {
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

  /*** Utils ***
  watchTwoFieldsChange(field1: string, field2: string) {
    const control1 = this.authForm.get('firstName');
    const control2 = this.authForm.get('lastName');
    if (control1 && control2) {
      combineLatest([
        control1.valueChanges.pipe(startWith(this.authForm.get('firstName')!.value)),
        control2.valueChanges.pipe(startWith(this.authForm.get('lastName')!.value))
      ]).subscribe(([val1, val2]) => {
        console.log(`Both fields changed - ${field1}: ${val1}, ${field2}: ${val2}`);
        const newAlphaName = this.getInitials(val1 + ' ' + val2);
        if (this.alphabeticName != newAlphaName) {
          this.alphabeticName = newAlphaName;
          this.randomColor = this.getRandomColor();
        }
      });
    }
  } **/

  // getInitials(name) {
  //   if (!name) return "";
  //   const words = name.trim().split(" ");
  //   console.log(`words now - ${words}`);
  //   if (words.length === 1) return words[0][0];
  //   return words[0][0] + words[1][0];
  // }

  // getRandomColor() {
  //   const colors = ["#F44336", "#3F51B5", "#4CAF50", "#FF9800", "#9C27B0", "#2196F3", "#00BCD4", "#8BC34A"];
  //   return colors[Math.floor(Math.random() * colors.length)];
  // }

}
