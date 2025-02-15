import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface Document {
  title: string;
  type: string;
  size: number;
  icon: string;
  iconClass: string;
  textClass: string;
}

@Component({
  selector: 'app-subject-form',
  imports: [ MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule
  ],
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
