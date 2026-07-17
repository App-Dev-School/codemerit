import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BadgeSource } from '@core/models/gamification.model';
import { bounceInAnimation } from '@shared/animations';

export interface BadgeCardData {
  code: string;
  name: string;
  description?: string;
  points?: number;
  earnedAt?: string | null;
  // Cosmetic only — drives the "Awarded by an interviewer" vs "Earned automatically" tag.
  source?: BadgeSource | null;
}

@Component({
  selector: 'app-badge-earned-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-earned-card.component.html',
  styleUrl: './badge-earned-card.component.scss',
  animations: [bounceInAnimation],
})
export class BadgeEarnedCardComponent {
  /** 'reveal' = fullscreen unlock moment (post-quiz celebration). 'tile' = grid item (badge showcase). */
  @Input() variant: 'reveal' | 'tile' = 'reveal';
  @Input() badge!: BadgeCardData;
  @Input() locked = false;
  @Output() dismiss = new EventEmitter<void>();

  onDismiss(): void {
    this.dismiss.emit();
  }

  get sourceLabel(): string | null {
    if (this.locked || !this.badge?.source) return null;
    return this.badge.source === 'System' ? 'Earned automatically' : 'Awarded by an interviewer';
  }
}
