import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { RequestablePermission } from '@core/models/permission.model';
import { permissionsService } from '../../../../admin/permissions-dashboard/manage/permissions.service';

export interface RequestPermissionDialogData {
  permission: RequestablePermission;
}

@Component({
  selector: 'app-request-permission-dialog',
  templateUrl: './request-permission-dialog.component.html',
  styleUrls: ['./request-permission-dialog.component.scss'],
  imports: [FormsModule, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class RequestPermissionDialogComponent {
  comment = '';
  submitting = false;
  errorMessage = '';

  constructor(
    public dialogRef: MatDialogRef<RequestPermissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RequestPermissionDialogData,
    private permissionsService: permissionsService,
  ) {}

  get commentTooShort(): boolean {
    return this.comment.trim().length > 0 && this.comment.trim().length < 5;
  }

  get canSubmit(): boolean {
    return this.comment.trim().length >= 5 && !this.submitting;
  }

  submit(): void {
    if (!this.canSubmit) return;
    this.errorMessage = '';
    this.submitting = true;
    this.permissionsService.requestPermission({
      permissionId: this.data.permission.id,
      comment: this.comment.trim(),
    }).subscribe({
      next: (request) => {
        this.submitting = false;
        this.dialogRef.close({ success: true, data: request });
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.message || 'Could not submit request.';
      },
    });
  }
}
