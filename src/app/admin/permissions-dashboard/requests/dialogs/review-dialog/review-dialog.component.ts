import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { PermissionRequest } from '@core/models/permission.model';
import { permissionsService } from '../../../manage/permissions.service';

export interface ReviewDialogData {
  request: PermissionRequest;
  action: 'approve' | 'reject';
}

@Component({
  selector: 'app-permission-request-review-dialog',
  templateUrl: './review-dialog.component.html',
  styleUrls: ['./review-dialog.component.scss'],
  imports: [FormsModule, MatDialogContent, MatDialogActions, MatDialogClose],
})
export class ReviewRequestDialogComponent {
  reviewComment = '';
  submitting = false;
  errorMessage = '';

  constructor(
    public dialogRef: MatDialogRef<ReviewRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewDialogData,
    private permissionsService: permissionsService,
  ) {}

  get isApprove(): boolean {
    return this.data.action === 'approve';
  }

  confirm(): void {
    this.errorMessage = '';
    this.submitting = true;
    this.permissionsService
      .reviewPermissionRequest(this.data.request.id, this.data.action, this.reviewComment.trim() || undefined)
      .subscribe({
        next: () => {
          this.submitting = false;
          this.dialogRef.close({ success: true });
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage = err?.error?.message || `Failed to ${this.data.action} this request.`;
        },
      });
  }
}
