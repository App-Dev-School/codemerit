import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AuthService } from '@core';
import { Badge } from '@core/models/gamification.model';
import { MasterService } from '@core/service/master.service';
import { BadgeEarnedCardComponent } from '@shared/components/badge-earned-card/badge-earned-card.component';

export interface BadgeSection {
  key: string;
  title: string;
  earned: Badge[];
  locked: Badge[];
}

// Sort key prefixes that bucket sections in display order: General first, then each
// Subject immediately followed by its own Topic-scoped badges, then JobRole-scoped
// badges last (they span multiple subjects, so there's no subject to nest under).
const GLOBAL_SORT_PREFIX = '!';
const JOB_ROLE_SORT_PREFIX = '~';

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

  constructor(private master: MasterService, private authService: AuthService) {}

  get sections(): BadgeSection[] {
    const sections = new Map<string, BadgeSection & { sortKey: string }>();

    const addTo = (badge: Badge, list: 'earned' | 'locked') => {
      const key = `${badge.scopeType}:${badge.scopeId ?? 'null'}`;
      let section = sections.get(key);
      if (!section) {
        section = { key, earned: [], locked: [], ...this.resolveSection(badge) };
        sections.set(key, section);
      }
      section[list].push(badge);
    };

    this.earned.filter((b) => this.isBadgeVisible(b)).forEach((b) => addTo(b, 'earned'));
    this.locked.filter((b) => this.isBadgeVisible(b)).forEach((b) => addTo(b, 'locked'));

    return [...sections.values()].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }

  // Only show badges relevant to what the user is actually enrolled in — the
  // /my-badges endpoint returns the entire published catalog with no enrollment
  // awareness, so this narrowing has to happen here.
  private get enrolledJobRoleIds(): Set<number> {
    return new Set((this.authService.getUserJobRoles() ?? []).map((ujr) => ujr.jobRoleId));
  }

  private get enrolledSubjectIds(): Set<number> {
    const roleIds = this.enrolledJobRoleIds;
    const ids: number[] = [];
    (this.master.jobRoles ?? [])
      .filter((jr: any) => roleIds.has(jr.id))
      .forEach((jr: any) => (jr.subjects ?? []).forEach((s: any) => ids.push(s.id)));
    return new Set(ids);
  }

  private isBadgeVisible(badge: Badge): boolean {
    switch (badge.scopeType) {
      case 'Global':
        return true;
      case 'JobRole':
        return badge.scopeId != null && this.enrolledJobRoleIds.has(badge.scopeId);
      case 'Subject':
        return badge.scopeId != null && this.enrolledSubjectIds.has(badge.scopeId);
      case 'Topic': {
        const topic = this.master.topics?.find((t: any) => t.id === badge.scopeId);
        return topic != null && this.enrolledSubjectIds.has(topic.subjectId);
      }
      default:
        return false;
    }
  }

  // Resolves both the display title and a sort key that groups a Subject's own badges
  // together with any Topic-scoped badges that belong to that same subject — previously
  // Topic-scoped badges (e.g. "Angular Routing Pro") were looked up against the JobRole
  // catalog by mistake, so they always missed and fell back to a generic "Job Role" label.
  private resolveSection(badge: Badge): { title: string; sortKey: string } {
    switch (badge.scopeType) {
      case 'Global':
        return { title: 'General', sortKey: GLOBAL_SORT_PREFIX };

      case 'Subject': {
        const title = this.master.subjects?.find((s: any) => s.id === badge.scopeId)?.title ?? 'Subject';
        return { title, sortKey: `${title}/0` };
      }

      case 'Topic': {
        const topic = this.master.topics?.find((t: any) => t.id === badge.scopeId);
        const subject = topic ? this.master.subjects?.find((s: any) => s.id === topic.subjectId) : null;
        const topicTitle = topic?.title ?? 'Topic';
        if (!subject) return { title: topicTitle, sortKey: `${topicTitle}/1` };
        return { title: `${subject.title} · ${topicTitle}`, sortKey: `${subject.title}/1/${topicTitle}` };
      }

      case 'JobRole': {
        const title = this.master.jobRoles?.find((r: any) => r.id === badge.scopeId)?.title ?? 'Job Role';
        return { title, sortKey: `${JOB_ROLE_SORT_PREFIX}/${title}` };
      }

      default:
        return { title: 'General', sortKey: GLOBAL_SORT_PREFIX };
    }
  }
}
