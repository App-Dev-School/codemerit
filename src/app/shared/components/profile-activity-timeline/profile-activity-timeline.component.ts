import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ProfileActivity } from '@core/models/user-profile.model';

const ICON_BY_DATA_TYPE: Record<string, string> = {
  badge: '🏅',
  certificate: '🎓',
  streak: '🔥',
  quiz: '📝',
};

@Component({
  selector: 'app-profile-activity-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-activity-timeline.component.html',
  styleUrl: './profile-activity-timeline.component.scss',
})
export class ProfileActivityTimelineComponent {
  @Input() activities: ProfileActivity[] = [];

  // dataType is often null (e.g. "Level Up" events) — fall back to matching
  // the title text in that case rather than showing a generic bell for
  // every level-up.
  iconFor(activity: ProfileActivity): string {
    if (activity.dataType && ICON_BY_DATA_TYPE[activity.dataType]) {
      return ICON_BY_DATA_TYPE[activity.dataType];
    }
    if (activity.title?.toLowerCase().includes('level up')) return '⭐';
    return '🔔';
  }
}
