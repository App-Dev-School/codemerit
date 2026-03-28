import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { SkillRating, SkillRatingSession } from '@core/models/skill-rating';
import { UtilsService } from '@core/service/utils.service';
import { MasterService } from '@core/service/master.service';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { SkillRatingComponent } from '@shared/components/skill-rating/skill-rating.component';
import { SkillType } from '@core/models/skill-type';
import { AuthService } from '@core/service/auth.service';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { SkillRatingWidgetComponent } from '@shared/components/skill-rating-widget/skill-rating-widget.component';

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
    MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatDivider,
    SkillRatingComponent,
    SkillRatingWidgetComponent,
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
export class WizardComponent implements OnInit {
  @Input() jobRoleSlug!: string;
  subjects: any[] = [];
  steps: any[] = [];
  skillForm: FormGroup;
  loading = true;
  private fb = inject(FormBuilder);

  constructor(
    public utility: UtilsService,
    private masterService: MasterService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.skillForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('jobRoleSlug');
      if (slug) {
        this.jobRoleSlug = slug;
        this.loadSubjectsForJobRole(slug);
      }
    });
  }

  loadSubjectsForJobRole(slug: string) {
    // Try to get jobRoles from masterService (assume already loaded)
    const jobRoles = this.masterService.getJobRoleMap?.() || this.masterService.jobRoles;
    let jobRole = null;
    if (Array.isArray(jobRoles)) {
      jobRole = jobRoles.find((role: any) => role.slug === slug);
    }
    if (jobRole && Array.isArray(jobRole.subjects)) {
      this.subjects = jobRole.subjects;
      this.buildStepsAndForm();
    } else {
      console.log("Job Roles not found in MasterService, fetching from API...");
      this.masterService.fetchJobRoleSubjectMapping().subscribe((roles: any[]) => {
        const found = roles.find((role: any) => role.slug === slug);
        if (found && Array.isArray(found.subjects)) {
          this.subjects = found.subjects;
          this.buildStepsAndForm();
        }
      });
    }
  }

  buildStepsAndForm() {
    // One step per subject, plus summary
    console.log("Building steps and form for subjects:", this.subjects);
    this.steps = this.subjects.map((subject, idx) => ({
      label: subject.title,
      subject
    }));
    //this.steps.push({ label: 'Summary', summary: true });

    // Build form: one group per subject
    const group: any = {};
    for (const subject of this.subjects) {
      const subjectGroup = this.fb.group({
        knows: [null, Validators.required],
        level: [null],
        rating: [null]
      });

      subjectGroup.get('knows')?.valueChanges.subscribe(val => {
        if (val === true) {
          subjectGroup.get('level')?.setValidators(Validators.required);
          subjectGroup.get('rating')?.setValidators(Validators.required);
        } else {
          subjectGroup.get('level')?.clearValidators();
          subjectGroup.get('rating')?.clearValidators();
          subjectGroup.patchValue({ level: null, rating: null });
        }
        subjectGroup.get('level')?.updateValueAndValidity();
        subjectGroup.get('rating')?.updateValueAndValidity();
      });

      group[subject.id] = subjectGroup;
    }
    this.skillForm = this.fb.group(group);
    this.loading = false;
  }



  getSubjectGroup(subjectId: number): FormGroup {
    return this.skillForm.get(subjectId.toString()) as FormGroup;
  }

  knowsSubject(subjectId: number): boolean {
    return this.getSubjectGroup(subjectId)?.get('knows')?.value === true;
  }


  getAllSubjectEntries(): SkillRating[] {
    const result: SkillRating[] = [];
    for (const subject of this.subjects) {
      const control = this.skillForm.get(subject.id.toString());
      const value = control?.value;
      if (value) {
        result.push({
          skillId: subject.id,
          skillName: subject.title,
          imageUrl: subject.image,
          skillType: SkillType.Subject,
          ratingType: RatingType.Self,
          knows: value.knows ?? false,
          level: value.level ?? '',
          rating: value.rating ?? null,
          grade: value.rating ? this.utility.getGrade(value.rating) : ''
        });
      }
    }
    return result;
  }

  onSubmit() {
    const flatData = this.getAllSubjectEntries();
    const assessment: Partial<SkillRatingSession> = {
      user_id: this.authService.currentUserValue.id,
      ratedBy: this.authService.currentUserValue.id,
      assessmentTitle: 'Self Skill Rating',
      notes: '',
      skillRatings: flatData
    };
    console.log('Payload =>', assessment);
    console.log('flatData =>', flatData);
    //this.loading = true;
    //this.subs.sink = 
    this.authService
      .submitSkillRatingSession(assessment)
      .subscribe({
        next: (res) => {
          console.log("SubmitSkillrating API", res);
          if (res && !res.error) {
            setTimeout(() => {
              console.log("SubmitSkillrating API User dashboard redirection ", res.data.role);
              this.authService.redirectToUserDashboard();
            }, 1000);
          }
          //res.data
        },
        error: (error) => {
          console.error("SubmitSkillrating API error", error);
        },
      });
  }
}