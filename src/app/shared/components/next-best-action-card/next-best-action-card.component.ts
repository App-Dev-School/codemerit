import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NextTrackNudge } from '@core/models/gamification.model';

@Component({
  selector: 'app-next-best-action-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './next-best-action-card.component.html',
  styleUrl: './next-best-action-card.component.scss',
})
export class NextBestActionCardComponent {
  @Input() nextCertificationTrack: NextTrackNudge | null = null;
  @Input() nextSubjectTrack: NextTrackNudge | null = null;
  @Output() continueClick = new EventEmitter<void>();

  get allCaughtUp(): boolean {
    return !this.nextCertificationTrack && !this.nextSubjectTrack;
  }

  onContinue(): void {
    this.continueClick.emit();
  }
}
