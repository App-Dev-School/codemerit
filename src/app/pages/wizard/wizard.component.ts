import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  MatButtonModule
} from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatRadioModule
} from '@angular/material/radio';
import {
  MatStepperModule
} from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { RatingType } from '@core/models/rating-type';
import { AssessmentSessionCreateDto } from '@core/models/skill-rating';
import { UtilsService } from '@core/service/utils.service';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { SkillRatingComponent } from '@shared/components/skill-rating/skill-rating.component';

@Component({
  standalone: true,
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  imports: [
    CommonModule,
    BreadcrumbComponent,
    FormsModule,
    ReactiveFormsModule,
    MatIcon,
    MatStepperModule,
    MatRadioModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatRippleModule,
    MatInputModule,
    SkillRatingComponent,
    MatTableModule
  ],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-5px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class WizardComponent {
  private fb = inject(FormBuilder);

  // Subjects grouped into steps
  categories = [
    { name: 'basics', label: 'Basic Skills Rating', subjects: ['HTML', 'CSS', 'JavaScript'] },
    { name: 'advanced', label: 'Advanced Skills Rating:', subjects: ['Angular', 'React', 'Other Framework'] },
    { name: 'intermediate', label: 'Other Essential Skills Rating:', subjects: ['Git'] }
  ];

  skillForm = this.fb.group({});

  constructor(public utility: UtilsService) {
    this.initForm();
  }

  private initForm() {
    for (const category of this.categories) {
      const categoryGroup = this.fb.group({});
      for (const subject of category.subjects) {
        categoryGroup.addControl(subject, this.fb.group({
          knows: new FormControl(null, Validators.required),
          level: new FormControl(null),
          rating: new FormControl(null)
        }));
      }
      this.skillForm.addControl(category.name, categoryGroup);
    }
  }

  // Type-safe form accessors
  getCategoryGroupNoValidation(categoryName: string): FormGroup {
    return this.skillForm.get(categoryName) as FormGroup;
  }

  getCategoryGroup(categoryName: string): FormGroup {
    const group = this.skillForm.get(categoryName) as FormGroup;

    // Loop through all subject controls
    for (const controlName of Object.keys(group.controls)) {
      const subjectGroup = group.get(controlName) as FormGroup;
      const knows = subjectGroup.get('knows')?.value;

      // If user knows the subject, make rating required
      if (knows === true) {
        subjectGroup.get('rating')?.setValidators(Validators.required);
      } else {
        subjectGroup.get('rating')?.clearValidators();
      }

      subjectGroup.get('rating')?.updateValueAndValidity();
    }

    return group;
  }


  getSubjectGroup(categoryName: string, subject: string): FormGroup {
    return this.skillForm.get([categoryName, subject]) as FormGroup;
  }

  knowsSubject(category: string, subject: string): boolean {
    return this.getSubjectGroup(category, subject).get('knows')?.value === true;
  }

  getAllSubjectEntries(): { subject: string; knows: boolean; level: string; rating: number | null; grade: string; }[] {
    const result: { subject: string; knows: boolean; level: string; rating: number | null; grade: string }[] = [];

    for (const category of this.categories) {
      const categoryGroup = this.skillForm.get(category.name) as FormGroup;

      for (const subject of category.subjects) {
        const control = categoryGroup.get(subject);
        const value = control?.value;

        if (value) {
          result.push({
            subject,
            knows: value.knows ?? false,
            level: value.level ?? '',
            rating: value.rating ?? null,
            grade: this.utility.getGrade(value.rating)
          });
        }
      }
    }

    return result;
  }

  onSubmit() {
    //console.log(this.skillForm.value);
    //send flatData to API
    const flatData = this.getAllSubjectEntries();
    console.log(flatData);
    const assessment : Partial<AssessmentSessionCreateDto> = {
       user_id: 4,
             ratedBy: 4,
             assessmentTitle: 'Self Skill Rating',
             //skillRatings: flatData,
             notes: '',
             ratingType: RatingType.Self,
             skillRatings: []
    }
    console.log(assessment);
    alert(JSON.stringify(assessment));
  }
}