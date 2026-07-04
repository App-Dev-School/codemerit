import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from '@core/models/subject';
import { MasterService } from '@core/service/master.service';
import { SubjectTrackItem } from '../../subject-track-item.model';
import { SubjectTrackService } from '../../subject-tracks.service';

export interface SubjectTrackDialogData {
  action: 'add' | 'edit';
  trackItem?: SubjectTrackItem;
}

@Component({
  selector: 'app-subject-track-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class SubjectTrackFormComponent {
  action: 'add' | 'edit';
  dialogTitle: string;
  trackForm: UntypedFormGroup;
  subjects: Subject[] = [];
  isSubmitting = false;
  errorMessage: string | null = null;

  private initialFormValue: any;

  constructor(
    public dialogRef: MatDialogRef<SubjectTrackFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubjectTrackDialogData,
    private subjectTrackService: SubjectTrackService,
    private masterSrv: MasterService,
    private fb: UntypedFormBuilder,
  ) {
    this.action = data.action;
    this.dialogTitle =
      this.action === 'edit'
        ? 'Edit: ' + data.trackItem?.title
        : 'Create Subject Track';

    this.subjects = this.masterSrv.subjects;
    this.trackForm = this.buildForm();

    if (this.action === 'edit' && data.trackItem) {
      this.trackForm.patchValue({
        title: data.trackItem.title,
        description: data.trackItem.description ?? '',
        sortOrder: data.trackItem.sortOrder,
        isPublished: data.trackItem.isPublished,
        subjectId: data.trackItem.subjectId,
      });
      this.trackForm.get('subjectId')?.disable();
      this.initialFormValue = this.trackForm.getRawValue();
    }
  }

  private buildForm(): UntypedFormGroup {
    return this.fb.group({
      subjectId: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      sortOrder: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
      isPublished: [true],
    });
  }

  submit(): void {
    if (this.trackForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    this.errorMessage = null;

    const raw = this.trackForm.getRawValue();

    if (this.action === 'add') {
      const payload = {
        subjectId: Number(raw.subjectId),
        title: raw.title,
        description: raw.description || undefined,
        sortOrder: Number(raw.sortOrder),
        isPublished: raw.isPublished,
      };
      this.subjectTrackService.createSubjectTrack(payload).subscribe({
        next: (response) => this.dialogRef.close({ data: response }),
        error: (err: Error) => {
          this.errorMessage = err.message;
          this.isSubmitting = false;
        },
      });
    } else {
      const changedFields: any = {};
      for (const key of ['title', 'description', 'sortOrder', 'isPublished']) {
        if (raw[key] !== this.initialFormValue[key]) {
          changedFields[key] = key === 'sortOrder' ? Number(raw[key]) : raw[key];
        }
      }
      if (Object.keys(changedFields).length === 0) {
        this.dialogRef.close();
        return;
      }
      this.subjectTrackService.updateSubjectTrack(changedFields, this.data.trackItem!.id!).subscribe({
        next: (response) => this.dialogRef.close(response),
        error: (err: Error) => {
          this.errorMessage = err.message;
          this.isSubmitting = false;
        },
      });
    }
  }
}
