import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

interface Achievement {
  name: string;
  message: string;
  timestamp: string;
  imgSrc: string;
  colorClass?: string;
}

interface BadgeTier {
  ring: string;
  glow: string;
  label: string;
}

@Component({
  selector: 'app-recent-comments',
  imports: [CommonModule],
  templateUrl: './recent-comments.component.html',
  styleUrl: './recent-comments.component.scss'
})
export class RecentCommentsComponent {
  @Input() achievements: Achievement[] = [];

  readonly tiers: BadgeTier[] = [
    { ring: '#f59e0b', glow: 'rgba(245,158,11,0.18)',  label: 'Gold'     },
    { ring: '#a78bfa', glow: 'rgba(167,139,250,0.18)', label: 'Platinum' },
    { ring: '#94a3b8', glow: 'rgba(148,163,184,0.18)', label: 'Silver'   },
    { ring: '#fb923c', glow: 'rgba(251,146,60,0.18)',  label: 'Bronze'   },
  ];

  getTier(index: number): BadgeTier {
    return this.tiers[index % this.tiers.length];
  }
}
