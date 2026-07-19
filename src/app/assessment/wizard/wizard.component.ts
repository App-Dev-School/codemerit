import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RatingType } from '@core/models/rating-type';
import { SkillRating, SkillRatingSession } from '@core/models/skill-rating';
import { SkillType } from '@core/models/skill-type';
import { UtilsService } from '@core/service/utils.service';
import { MasterService } from '@core/service/master.service';
import { AuthService } from '@core/service/auth.service';
import { SkillRatingComponent } from '@shared/components/skill-rating/skill-rating.component';

type CardState = 'untouched' | 'partial' | 'complete' | 'skipped';

@Component({
  standalone: true,
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    SkillRatingComponent,
  ],
})
export class WizardComponent implements OnInit {
  @Input() jobRoleSlug!: string;

  private fb = inject(FormBuilder);

  subjects: any[] = [];
  jobRoleTitle = '';
  skillForm: FormGroup = this.fb.group({});
  loading = true;
  submitting = false;
  success = false;

  readonly levels = [
    { value: 'Basic', label: 'Basic' },
    { value: 'Working', label: 'Working' },
    { value: 'Expert', label: 'Expert' },
  ];

  constructor(
    public utility: UtilsService,
    private masterService: MasterService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('jobRoleSlug');
      if (slug) {
        this.jobRoleSlug = slug;
        this.loadSubjectsForJobRole(slug);
      } else {
        this.resolveJobRoleForRating();
      }
    });
  }

  // No jobRoleSlug in the URL — figure out where to send the user instead of
  // rendering an empty wizard:
  //  1. An enrolled job role with no self-rating coverage yet -> straight into it.
  //  2. Otherwise (nothing enrolled, or everything already has some rating) ->
  //     the job-role picker, in skill-rating mode, so it lands back here with a slug.
  private resolveJobRoleForRating(): void {
    const enrolled = this.authService.getUserJobRoles();
    if (!enrolled.length) {
      this.goToJobRolePicker();
      return;
    }

    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      this.goToJobRolePicker();
      return;
    }

    this.authService.fetchSkillRatingSessions(userId).subscribe(sessions => {
      // Every subject id this user has ever submitted a rating for, across every
      // past session (sessions carry no jobRoleId, so this is the closest available
      // signal — see fetchSkillRatingSessions()).
      const ratedSubjectIds = new Set<number>(
        sessions.reduce((ids: number[], s: any) => ids.concat(
          (s.skillRatings ?? [])
            .filter((r: any) => r.skillType === 'Subject')
            .map((r: any) => r.skillId)
        ), [])
      );

      const jobRoles = this.masterService.jobRoles ?? [];
      const unrated = enrolled.find(ujr => {
        const role = jobRoles.find((jr: any) => jr.id === ujr.jobRoleId);
        const subjectIds: number[] = (role?.subjects ?? []).map((s: any) => s.id);
        // "No SelfRating entry" -> none of this role's subjects have been rated at all.
        return subjectIds.length > 0 && subjectIds.every(id => !ratedSubjectIds.has(id));
      });

      const unratedRole = unrated ? jobRoles.find((jr: any) => jr.id === unrated.jobRoleId) : null;
      if (unratedRole?.slug) {
        this.router.navigate(['/assessment/skill-rating', unratedRole.slug], { replaceUrl: true });
      } else {
        this.goToJobRolePicker();
      }
    });
  }

  private goToJobRolePicker(): void {
    this.router.navigate(['/select-job-role'], { queryParams: { mode: 'skill-rating' }, replaceUrl: true });
  }

  private loadSubjectsForJobRole(slug: string): void {
    const jobRoles = this.masterService.jobRoles;
    const jobRole = Array.isArray(jobRoles) ? jobRoles.find((role: any) => role.slug === slug) : null;
    if (jobRole?.subjects?.length) {
      this.subjects = jobRole.subjects;
      this.jobRoleTitle = jobRole.title ?? '';
      this.buildForm();
    } else {
      this.masterService.fetchJobRoleSubjectMapping().subscribe((roles: any[]) => {
        const found = roles.find((role: any) => role.slug === slug);
        this.subjects = found?.subjects ?? [];
        this.jobRoleTitle = found?.title ?? '';
        this.buildForm();
      });
    }
  }

  private buildForm(): void {
    const group: any = {};
    for (const subject of this.subjects) {
      const subjectGroup = this.fb.group({
        knows: this.fb.control<boolean | null>(null, Validators.required),
        level: this.fb.control<string | null>(null),
        rating: this.fb.control<number | null>(null),
      });

      // "knows" drives validity, but the user never has to answer it directly —
      // picking a level or a star (below) sets it to true implicitly.
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

      // A star click goes straight into the FormControl via the CVA on
      // app-skill-rating, bypassing setLevel()/setKnows() below — so it needs
      // its own listener to mark "knows" true the same way a level pill does.
      subjectGroup.get('rating')?.valueChanges.subscribe(val => {
        if (val && subjectGroup.get('knows')?.value !== true) {
          subjectGroup.get('knows')?.setValue(true);
        }
      });

      group[subject.id] = subjectGroup;
    }
    this.skillForm = this.fb.group(group);
    this.loading = false;
  }

  getSubjectGroup(subjectId: number): FormGroup {
    return this.skillForm.get(subjectId.toString()) as FormGroup;
  }

  /** A level pill or a star rating both count as "yes" — no separate Yes/No step. */
  setLevel(subjectId: number, level: string): void {
    const group = this.getSubjectGroup(subjectId);
    if (group?.get('knows')?.value !== true) group?.get('knows')?.setValue(true);
    group?.get('level')?.setValue(level);
  }

  markNotFamiliar(subjectId: number): void {
    this.getSubjectGroup(subjectId)?.get('knows')?.setValue(false);
  }

  undoNotFamiliar(subjectId: number): void {
    this.getSubjectGroup(subjectId)?.get('knows')?.setValue(null);
  }

  cardState(subjectId: number): CardState {
    const group = this.getSubjectGroup(subjectId);
    const knows = group?.get('knows')?.value;
    if (knows === false) return 'skipped';
    if (knows === true) {
      return group?.get('level')?.value && group?.get('rating')?.value ? 'complete' : 'partial';
    }
    return 'untouched';
  }

  /** null lets the default border-cm-border class show through; a hex value overrides it. */
  cardBorderColor(subjectId: number): string | null {
    const state = this.cardState(subjectId);
    if (state === 'complete') return '#34d399';
    if (state === 'partial') return '#6366f1';
    return null;
  }

  isAnswered(subjectId: number): boolean {
    const state = this.cardState(subjectId);
    return state === 'complete' || state === 'skipped';
  }

  get answeredCount(): number {
    return this.subjects.filter(s => this.isAnswered(s.id)).length;
  }

  get progressPercent(): number {
    return this.subjects.length ? Math.round((this.answeredCount / this.subjects.length) * 100) : 0;
  }

  getAllSubjectEntries(): SkillRating[] {
    const result: SkillRating[] = [];
    for (const subject of this.subjects) {
      const value = this.skillForm.get(subject.id.toString())?.value;
      if (value) {
        result.push({
          skillId: subject.id,
          skillName: subject.title,
          imageUrl: subject.image,
          skillType: SkillType.Subject,
          ratingType: RatingType.Self,
          knows: value.knows ?? false,
          level: value.level ?? '',
          rating: value.rating ?? 0,
          grade: value.rating ? this.utility.getGrade(value.rating) : '',
        });
      }
    }
    return result;
  }

  onSubmit(): void {
    if (this.skillForm.invalid || this.submitting) return;
    this.submitting = true;

    const assessment: Partial<SkillRatingSession> = {
      userId: this.authService.currentUserValue.id,
      ratedBy: this.authService.currentUserValue.id,
      assessmentTitle: 'Self Skill Rating',
      notes: '',
      ratingType: RatingType.Self,
      skillRatings: this.getAllSubjectEntries(),
    };

    this.authService.submitSkillRatingSession(assessment).subscribe({
      next: (res) => {
        if (res && !res.error) {
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/jobRole', this.jobRoleSlug], { replaceUrl: true });
          }, 5000);
        } else {
          this.submitting = false;
        }
      },
      error: (error) => {
        console.error('SubmitSkillrating API error', error);
        this.submitting = false;
      },
    });
  }
}
