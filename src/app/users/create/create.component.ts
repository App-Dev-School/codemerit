import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgxEditorModule, Toolbar } from 'ngx-editor';
import { Editor } from 'ngx-editor';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '@core/service/snackbar.service';
import { AuthService } from '@core/service/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { AuthConstants } from '@config/AuthConstants';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { AsyncPipe, NgStyle } from '@angular/common';
import { ReviewWidgetComponent } from '@shared/components/review-widget/review-widget.component';
import { SkillRatingComponent } from '@shared/components/skill-rating/skill-rating.component';
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
    NgxEditorModule,
    NgStyle,
    AsyncPipe
  ]
})
export class CreateUserComponent implements OnInit, OnDestroy {
  constructor(private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: SnackbarService,
    public authService: AuthService) { }
     userRating = signal(7);
  authForm!: UntypedFormGroup;
  editor?: Editor;
  html = '';
  submitted = false;
  error = "";
  filteredOptions?: Observable<string[]>;
  randomColor: string = "#000000";
  alphabeticName = "";
  options: string[] = ['Pursuing B.E/B.Tech', 'IT Fresher', 'IT Programmer (0-2 Yrs)', 'Experienced IT Professional'];
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  ngOnInit(): void {
    this.authForm = this.formBuilder.group({
      firstName: ['Test', Validators.required],
      lastName: ['Tolle'],
      email: [
        'test@gmailed.com',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      mobile: ['8767095566', [Validators.minLength(9)]],
      city: ['Bengaluru', Validators.required],
      country: ['India', Validators.required],
      designation: ['IT Programmer', Validators.required]
    });
    // this.editor = new Editor();
    // this.filteredOptions = this.authForm.valueChanges.pipe(
    //   startWith(''),
    //   map((name) => (name ? this._filter(name) : this.options.slice()))
    // );
    this.watchTwoFieldsChange('firstName', 'lastName');
    this.randomColor = this.getRandomColor();
  }

  private _filter(name: string): string[] {
    console.log("FixIssue _filter@@@ ", typeof name, name);
      
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
      let postData = {
        firstName: this.authForm.get('firstName')?.value,
        lastName: this.authForm.get('lastName')?.value,
        email: this.authForm.get('email')?.value,
        mobile: this.authForm.get('mobile')?.value,
        city: this.authForm.get('city')?.value,
        country: this.authForm.get('country')?.value,
        designation: this.authForm.get('designation')?.value.name
      };

      this.authService.register(postData).subscribe((res) => {
        this.submitted = false;
        if (res) {
          if (AuthConstants.DEV_MODE) {
            console.log("/******* Create User APIResponse => " + JSON.stringify(res));
          }
          if (!res.error) {
            if (res.data) {
              //this.authService.setAuthData(res.userData);
              // let serverDelay = setTimeout(() => {
              //   this.authService.navigateAfterLogin();
              // }, 3000)
              // this.timeOutIDs.push(serverDelay);
              this.router.navigate(['/users/list']);
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

  // make sure to destory the editor
  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  displayFn(user: string): string {
    return user;
  }

  /*** Utils ****/
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
  }

  getInitials(name) {
    if (!name) return "";
    const words = name.trim().split(" ");
    console.log(`words now - ${words}`);
    if (words.length === 1) return words[0][0];
    return words[0][0] + words[1][0];
  }

  getRandomColor() {
    const colors = ["#F44336", "#3F51B5", "#4CAF50", "#FF9800", "#9C27B0", "#2196F3", "#00BCD4", "#8BC34A"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

}
