import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LeaderboardEntry, LeaderboardPeriod } from '@core/models/gamification.model';

@Component({
  selector: 'app-leaderboard-rank-teaser',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './leaderboard-rank-teaser.component.html',
  styleUrl: './leaderboard-rank-teaser.component.scss',
})
export class LeaderboardRankTeaserComponent {
  @Input() userRank: number | null = null;
  @Input() period: LeaderboardPeriod = 'weekly';
  // Top of the board, for a small avatar-stack "who's ahead of you" social
  // proof touch — already fetched as part of the leaderboard response, no
  // extra call needed.
  @Input() topEntries: LeaderboardEntry[] = [];

  get periodLabel(): string {
    return this.period === 'all-time' ? 'all-time' : this.period;
  }

  get avatarStack(): LeaderboardEntry[] {
    return this.topEntries.slice(0, 3);
  }

  initials(name: string): string {
    return (name || '?').trim().charAt(0).toUpperCase();
  }
}
