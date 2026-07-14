import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Badge } from '@core/models/gamification.model';

@Component({
  selector: 'app-badge-progress-teaser',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './badge-progress-teaser.component.html',
  styleUrl: './badge-progress-teaser.component.scss',
})
export class BadgeProgressTeaserComponent {
  @Input() earned: Badge[] = [];
  @Input() locked: Badge[] = [];

  get total(): number {
    return this.earned.length + this.locked.length;
  }

  get percent(): number {
    return this.total > 0 ? Math.round((this.earned.length / this.total) * 100) : 0;
  }

  // Most recently earned badge, if any — gives the teaser something concrete
  // to show instead of just a bare count.
  get latestBadge(): Badge | null {
    if (!this.earned.length) return null;
    return [...this.earned].sort((a, b) => (b.earnedAt ?? '').localeCompare(a.earnedAt ?? ''))[0];
  }

  // A small "collection strip" — earned badges first (most recent first),
  // padded out to 5 slots with locked placeholders — so this reads as an
  // actual collection to complete, not just a number.
  get previewSlots(): { badge: Badge; locked: boolean }[] {
    const earnedSorted = [...this.earned].sort((a, b) => (b.earnedAt ?? '').localeCompare(a.earnedAt ?? ''));
    const slots = [
      ...earnedSorted.map((badge) => ({ badge, locked: false })),
      ...this.locked.map((badge) => ({ badge, locked: true })),
    ];
    return slots.slice(0, 5);
  }
}
