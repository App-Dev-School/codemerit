import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { bounceInAnimation } from '@shared/animations';

export interface BadgeCardData {
  code: string;
  name: string;
  description?: string;
  points?: number;
  earnedAt?: string | null;
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
}
