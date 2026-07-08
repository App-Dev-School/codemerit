import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CertificationTrack } from '@core/models/subject-dashboard.model';

@Component({
  selector: 'app-certification-tracks',
  imports: [CommonModule],
  templateUrl: './certification-tracks.component.html',
  styleUrl: './certification-tracks.component.scss'
})
export class CertificationTracksComponent {
  @Input() certificationTracks: CertificationTrack[] = [];

  @Output() startLearning = new EventEmitter<CertificationTrack>();
  @Output() viewCertificate = new EventEmitter<CertificationTrack>();

  selectedIdx = 0;

  getCompletedCount(cert: CertificationTrack): number {
    return (cert.subjectTracks ?? []).filter(t => t.isCompleted).length;
  }

  getProgress(cert: CertificationTrack): number {
    const total = cert.totalSubjectTracks || cert.subjectTracks?.length || 0;
    if (!total) return 0;
    return Math.round((this.getCompletedCount(cert) / total) * 100);
  }

  onStartLearning(cert: CertificationTrack): void {
    this.startLearning.emit(cert);
  }

  onViewCertificate(cert: CertificationTrack): void {
    this.viewCertificate.emit(cert);
  }
}
