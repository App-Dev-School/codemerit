import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CachedGamificationStats, getLevelProgress, LevelProgress } from '@core/models/gamification.model';

@Component({
  selector: 'app-xp-streak-widget',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './xp-streak-widget.component.html',
  styleUrl: './xp-streak-widget.component.scss',
})
export class XpStreakWidgetComponent {
  // Sourced from a sessionStorage cache written right after a quiz submit
  // (see quiz-result.component.ts) — there is no endpoint yet that exposes a
  // user's current points/level/streak outside that one-shot moment, so a
  // user who hasn't taken a quiz this session sees the empty state below
  // even if they have real historical points. Flagged for a future backend
  // "my current totals" endpoint.
  @Input() stats: CachedGamificationStats | null = null;

  get progress(): LevelProgress | null {
    return this.stats ? getLevelProgress(this.stats.totalPoints) : null;
  }
}
