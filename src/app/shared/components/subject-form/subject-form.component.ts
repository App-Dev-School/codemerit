import { Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-subject-form',
  imports: [ReactiveFormsModule],
  templateUrl: './subject-form.component.html',
  styleUrl: './subject-form.component.scss'
})
export class SubjectFormComponent {
  subjectForm: UntypedFormGroup;

  constructor(fb: UntypedFormBuilder) {
    this.subjectForm = fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.pattern('[a-zA-Z]+')]],
      label: ['', [Validators.required]],
      description: ['', [Validators.required]],
      is_published: [false],
    });
  }

  onSubjectFormSubmit() {
    console.log('Subject Form Value', this.subjectForm.value);
  }
}
