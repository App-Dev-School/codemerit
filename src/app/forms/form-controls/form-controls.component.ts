import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormGroupDirective, NgForm, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher, MatOptionModule } from '@angular/material/core';
import { ThemePalette } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { SubjectFormComponent } from '@shared/components/subject-form/subject-form.component';
import { TopicFormComponent } from '@shared/components/topic-form/topic-form.component';
interface Animal {
  name: string;
  sound: string;
}
interface Pokemon {
  value: string;
  viewValue: string;
}
interface PokemonGroup {
  disabled?: boolean;
  name: string;
  pokemon: Pokemon[];
}
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}
@Component({
    selector: 'app-form-controls',
    templateUrl: './form-controls.component.html',
    styleUrls: ['./form-controls.component.scss'],
    imports: [
        BreadcrumbComponent,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        FileUploadComponent,
        MatCheckboxModule,
        MatRadioModule,
        MatDatepickerModule,
        MatButtonModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        MatSlideToggleModule,
        SubjectFormComponent,
        TopicFormComponent
    ]
})
export class FormControlsComponent {
  // Form
  subjectForm: UntypedFormGroup;
  fileUploadForm: UntypedFormGroup;
  hideRequiredControl = new UntypedFormControl(false);
  floatLabelControl = new UntypedFormControl('auto');
  // checkbox
  checked = false;
  indeterminate = false;
  labelPosition: 'before' | 'after' = 'after';
  disabled = false;
  // Radio buttions
  questionOptions?: string;
  options: string[] = ['Static Typing', 'Dynamic Typing'];
  multiOptions: string[] = ['Enum', 'Promise', 'Interface', 'Class'];


  // animalControl = new UntypedFormControl('', Validators.required);
  // selectFormControl = new UntypedFormControl('', Validators.required);
  // animals: Animal[] = [
  //   { name: 'Dog', sound: 'Woof!' },
  //   { name: 'Cat', sound: 'Meow!' },
  //   { name: 'Cow', sound: 'Moo!' },
  //   { name: 'Fox', sound: 'Wa-pa-pa-pa-pa-pa-pow!' },
  // ];


  matcher = new MyErrorStateMatcher();
  // Slide toggle
  color: ThemePalette = 'accent';
  constructor(fb: UntypedFormBuilder) {
    this.subjectForm =  fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.pattern('[a-zA-Z]+')]],
      label: ['', [Validators.required]],
      description: ['', [Validators.required]],
      is_published: [false],
    });

    this.fileUploadForm = fb.group({
      uploadFile: [''],
    });
  }

  onSubjectFormSubmit() {
    console.log('Form Value', this.subjectForm.value);
  }
}
