import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '@core/service/master.service';

interface SubjectGroups {
  mandatory:   any[];
  recommended: any[];
  optional:    any[];
}

@Component({
  selector: 'app-course-picker',
  imports: [CommonModule],
  templateUrl: './course-picker.component.html',
  styleUrls: ['./course-picker.component.scss']
})
export class CoursePickerComponent implements OnInit {
  @Input() minimal = true;
  @Input() currentCourses: number[] = [];
  @Input() searchQuery = '';
  @Input() actionMode: 'view' | 'enroll' | 'skill-rating' = 'view';
  @Output() subjectSelected = new EventEmitter<string>();

  courses: any[] = [];
  isLoading = true;
  mode: 'dialog' | 'route' = 'route';
  userId?: string;

  constructor(
    private master: MasterService,
    private router: Router,
    private route: ActivatedRoute,
    @Optional() public dialogRef?: MatDialogRef<CoursePickerComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any,
  ) {
    if (this.dialogRef) {
      this.mode = 'dialog';
      this.userId = data?.id;
    } else {
      this.mode = 'route';
      this.route.paramMap.subscribe(params => {
        this.userId = params.get('id') ?? undefined;
      });
    }
  }

  ngOnInit(): void {
    const allJobRoles = this.master.jobRoles;
    if (allJobRoles?.length) {
      this.courses = allJobRoles.filter(j => j.isPublished);
    }
    this.isLoading = false;
  }

  get filteredCourses(): any[] {
    if (!this.searchQuery) return this.courses;
    const q = this.searchQuery.toLowerCase().trim();
    return this.courses.filter(job => {
      const title = (job.title || '').toString().toLowerCase();
      const desc = (job.description || '').toString().toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }

  isEnrolled(job: any): boolean {
    return job.isSubscribed || this.currentCourses.includes(+job.id);
  }

  getRoleAccent(id: number): string {
    const accents = ['indigo', 'violet', 'emerald', 'sky', 'rose', 'amber', 'teal'];
    return accents[id % accents.length];
  }

  getSubjectGroups(subjects: any[]): SubjectGroups {
    if (!subjects?.length) return { mandatory: [], recommended: [], optional: [] };

    const getType = (s: any): string =>
      (s.type ?? s.pivot?.type ?? s.category ?? '').toLowerCase();
    const hasTypes = subjects.some(s => getType(s));

    if (!hasTypes) {
      return { mandatory: subjects, recommended: [], optional: [] };
    }

    const isMandatory   = (s: any) => ['mandatory', 'core', 'required', 'must'].includes(getType(s));
    const isRecommended = (s: any) => getType(s) === 'recommended';
    const isOptional    = (s: any) => ['optional', 'elective', 'bonus'].includes(getType(s));

    return {
      mandatory:   subjects.filter(isMandatory),
      recommended: subjects.filter(isRecommended),
      optional:    subjects.filter(isOptional),
    };
  }

  getActionLabel(): string {
    return this.actionMode === 'skill-rating' ? 'Start Evaluation'
         : this.actionMode === 'enroll'       ? 'Enroll Now'
         : 'Explore';
  }

  switchJobRole(job: any) {
    this.subjectSelected.emit(job.slug);
    if (this.mode === 'dialog' && this.dialogRef) {
      this.dialogRef.close(job.slug);
    }
  }

  close() {
    if (this.mode === 'dialog' && this.dialogRef) {
      this.dialogRef.close('Dialog Closed');
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
