import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { SubjectTrackItem } from '../../subject-track-item.model';
import { SubjectTrackService } from '../../subject-tracks.service';

@Component({
  selector: 'app-subject-track-delete',
  templateUrl: './delete.component.html',
  imports: [MatDialogContent, MatDialogActions, MatDialogClose],
})
export class SubjectTrackDeleteComponent {
  isDeleting = false;

  constructor(
    public dialogRef: MatDialogRef<SubjectTrackDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubjectTrackItem,
    private subjectTrackService: SubjectTrackService,
  ) {}

  confirmDelete(): void {
    if (!this.data.id || this.isDeleting) return;
    this.isDeleting = true;
    this.subjectTrackService.deleteSubjectTrack(this.data.id).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        console.error('Delete error:', err);
        this.isDeleting = false;
        this.dialogRef.close(null);
      },
    });
  }
}
