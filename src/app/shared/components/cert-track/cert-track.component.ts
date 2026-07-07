import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CertificateModel } from '@shared/components/certificate/certificate.model';
import { CertificateComponent } from '@shared/components/certificate/certificate.component';

@Component({
  selector: 'app-cert-track',
  standalone: true,
  imports: [CommonModule, CertificateComponent, MatIconModule],
  templateUrl: './cert-track.component.html',
  styleUrls: ['./cert-track.component.scss']
})
export class CertTrackComponent {
  @Input() certificateModels: CertificateModel[] = [];
  @Input() courseData: any[] = [];
  @Output() startLearning = new EventEmitter<void>();
  @Output() viewCertificate = new EventEmitter<CertificateModel>();

  selectedCertIdx = 0;

  getCertRequirements(certIndex: number): any[] {
    if (!this.courseData?.length) return [];
    let subjects: any[];
    if (certIndex === 0) {
      const mandatory = this.courseData.filter((s: any) => s.tag === 'MANDATORY');
      subjects = mandatory.length > 0 ? mandatory : this.courseData;
    } else {
      subjects = this.courseData;
    }
    return subjects.map((s: any) => {
      const tracks = s.subjectTracks ?? [];
      const completed = tracks.length > 0
        ? tracks.every((t: any) => t.isCompleted)
        : (s.coverage ?? 0) >= 80;
      const progress = tracks.length > 0
        ? Math.round(tracks.reduce((acc: number, t: any) => acc + (t.progressPercent ?? 0), 0) / tracks.length)
        : (s.coverage ?? 0);
      return { id: s.id, title: s.title, completed, progress };
    });
  }

  getCertProgress(certIndex: number): number {
    const reqs = this.getCertRequirements(certIndex);
    if (!reqs.length) return 0;
    const completed = reqs.filter((r: any) => r.completed).length;
    return Math.round((completed / reqs.length) * 100);
  }

  onStartLearning(): void { this.startLearning.emit(); }
  onViewCertificate(cert: CertificateModel): void { this.viewCertificate.emit(cert); }
}
