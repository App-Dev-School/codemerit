import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { CertificationTrackItem } from '../../certification-track-item.model';
import { CertificationTrackService } from '../../certification-tracks.service';

@Component({
  selector: 'app-certification-track-delete',
  templateUrl: './delete.component.html',
  imports: [MatDialogContent, MatDialogActions, MatDialogClose],
})
export class CertificationTrackDeleteComponent {
  isDeleting = false;

  constructor(
    public dialogRef: MatDialogRef<CertificationTrackDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CertificationTrackItem,
    private certTrackService: CertificationTrackService,
  ) {}

  confirmDelete(): void {
    if (!this.data.id || this.isDeleting) return;
    this.isDeleting = true;
    this.certTrackService.deleteCertificationTrack(this.data.id).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        console.error('Delete error:', err);
        this.isDeleting = false;
        this.dialogRef.close(null);
      },
    });
  }
}
