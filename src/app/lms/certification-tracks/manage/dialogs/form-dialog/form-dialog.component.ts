import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MasterService } from '@core/service/master.service';
import { CertificationTrackItem } from '../../certification-track-item.model';
import { CertificationTrackService } from '../../certification-tracks.service';

export interface CertificationTrackDialogData {
  action: 'add' | 'edit';
  trackItem?: CertificationTrackItem;
}

@Component({
  selector: 'app-certification-track-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class CertificationTrackFormComponent {
  action: 'add' | 'edit';
  dialogTitle: string;
  trackForm: UntypedFormGroup;
  jobRoles: any[] = [];
  isSubmitting = false;
  errorMessage: string | null = null;

  private initialFormValue: any;

  constructor(
    public dialogRef: MatDialogRef<CertificationTrackFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CertificationTrackDialogData,
    private certTrackService: CertificationTrackService,
    private masterSrv: MasterService,
    private fb: UntypedFormBuilder,
  ) {
    this.action = data.action;
    this.dialogTitle =
      this.action === 'edit'
        ? 'Edit: ' + data.trackItem?.title
        : 'Create Certification Track';

    this.jobRoles = this.masterSrv.jobRoles;
    this.trackForm = this.buildForm();

    if (this.action === 'edit' && data.trackItem) {
      this.trackForm.patchValue({
        jobRoleId: data.trackItem.jobRoleId,
        title: data.trackItem.title,
        description: data.trackItem.description ?? '',
        sortOrder: data.trackItem.sortOrder,
        isPublished: data.trackItem.isPublished,
      });
      this.trackForm.get('jobRoleId')?.disable();
      this.initialFormValue = this.trackForm.getRawValue();
    }
  }

  private buildForm(): UntypedFormGroup {
    return this.fb.group({
      jobRoleId: ['', [Validators.required]],
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
        jobRoleId: Number(raw.jobRoleId),
        title: raw.title,
        description: raw.description || undefined,
        sortOrder: Number(raw.sortOrder),
        isPublished: raw.isPublished,
      };
      this.certTrackService.createCertificationTrack(payload).subscribe({
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
      this.certTrackService.updateCertificationTrack(changedFields, this.data.trackItem!.id!).subscribe({
        next: (response) => this.dialogRef.close(response),
        error: (err: Error) => {
          this.errorMessage = err.message;
          this.isSubmitting = false;
        },
      });
    }
  }
}
