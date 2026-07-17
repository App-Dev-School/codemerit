import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Badge } from '@core/models/gamification.model';
import { MasterService } from '@core/service/master.service';
import { BadgeEarnedCardComponent } from '@shared/components/badge-earned-card/badge-earned-card.component';

export interface BadgeSection {
  key: string;
  title: string;
  earned: Badge[];
  locked: Badge[];
}

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

  constructor(private master: MasterService) {}

  get sections(): BadgeSection[] {
    const sections = new Map<string, BadgeSection>();

    const addTo = (badge: Badge, list: 'earned' | 'locked') => {
      const key = `${badge.scopeType}:${badge.scopeId ?? 'null'}`;
      let section = sections.get(key);
      if (!section) {
        section = { key, title: this.resolveTitle(badge), earned: [], locked: [] };
        sections.set(key, section);
      }
      section[list].push(badge);
    };

    this.earned.forEach((b) => addTo(b, 'earned'));
    this.locked.forEach((b) => addTo(b, 'locked'));

    // "General" (Global) section always leads; the rest keep first-seen order.
    return [...sections.values()].sort((a, b) => {
      if (a.key.startsWith('Global:')) return -1;
      if (b.key.startsWith('Global:')) return 1;
      return 0;
    });
  }

  private resolveTitle(badge: Badge): string {
    if (badge.scopeType === 'Global') return 'General';
    const catalog = badge.scopeType === 'Subject' ? this.master.subjects : this.master.jobRoles;
    const match = (catalog ?? []).find((entry: any) => entry.id === badge.scopeId);
    if (match?.title) return match.title;
    return badge.scopeType === 'Subject' ? 'Subject' : 'Job Role';
  }
}
