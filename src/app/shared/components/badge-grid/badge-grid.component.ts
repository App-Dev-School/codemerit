import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Badge } from '@core/models/gamification.model';
import { BadgeEarnedCardComponent } from '@shared/components/badge-earned-card/badge-earned-card.component';

@Component({
  selector: 'app-badge-grid',
  standalone: true,
  imports: [CommonModule, BadgeEarnedCardComponent],
  templateUrl: './badge-grid.component.html',
  styleUrl: './badge-grid.component.scss',
})
export class BadgeGridComponent {
  @Input() earned: Badge[] = [];
  @Input() locked: Badge[] = [];
  @Input() loading = false;
}
