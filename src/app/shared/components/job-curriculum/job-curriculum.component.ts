import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RevealProgressDirective } from '@shared/directives/reveal-progress.directive';
import { InfoDrawerComponent } from '@shared/components/info-drawer/info-drawer.component';

@Component({
  selector: 'app-job-curriculum',
  standalone: true,
  imports: [CommonModule, MatIconModule, RevealProgressDirective, InfoDrawerComponent],
  templateUrl: './job-curriculum.component.html',
  styleUrls: ['./job-curriculum.component.scss']
})
export class JobCurriculumComponent {

  // "Understanding Scores" drawer — one shared explanation of Score/Accuracy/Coverage/
  // Mastery Level/difficulty tiers/subject priority, rather than a tooltip on every
  // single metric across this data-dense widget.
  showScoringGuide = false;
  openScoringGuide(): void { this.showScoringGuide = true; }
  closeScoringGuide(): void { this.showScoringGuide = false; }

  private _subjects: any[] = [];

  @Input() set subjects(val: any[]) {
    this._subjects = val ?? [];
    this.selectedIdx = 0;
    this.tracksExpanded = false;
  }
  get subjects(): any[] { return this._subjects; }

  @Output() exploreSubject = new EventEmitter<any>();

  selectedIdx = 0;

  // Show only the first few tracks by default — a subject with many tracks
  // was pushing the whole page's height up; "View all" reveals the rest on demand.
  readonly trackPreviewCount = 4;
  tracksExpanded = false;

  selectSubject(idx: number): void {
    this.selectedIdx = idx;
    this.tracksExpanded = false;
  }

  toggleTracksExpanded(): void {
    this.tracksExpanded = !this.tracksExpanded;
  }

  visibleTracks(subject: any): any[] {
    const tracks: any[] = subject?.subjectTracks ?? [];
    return this.tracksExpanded ? tracks : tracks.slice(0, this.trackPreviewCount);
  }

  isConnectorActive(idx: number): boolean {
    return this.selectedIdx === idx || this.selectedIdx === idx + 1;
  }

  // Left-panel grouping — Mandatory/Recommended/Optional come straight from the
  // jobRoleSubjects join's own `tag` field (backend seed confirms only these 3 values
  // plus the occasional untagged subject, bucketed here as "Other"). Each item keeps
  // its original flat index into `_subjects` since selectedIdx/isConnectorActive/
  // subjects[selectedIdx] elsewhere all assume that flat indexing.
  private readonly tagOrder = ['MANDATORY', 'RECOMMENDED', 'OPTIONAL'];
  private readonly tagLabels: Record<string, string> = {
    MANDATORY: 'Mandatory',
    RECOMMENDED: 'Recommended',
    OPTIONAL: 'Optional',
  };

  get groupedSubjects(): { key: string; label: string; items: { subject: any; index: number }[] }[] {
    const buckets = new Map<string, { subject: any; index: number }[]>();
    this._subjects.forEach((subject, index) => {
      const key = this.tagOrder.includes(subject?.tag) ? subject.tag : 'OTHER';
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push({ subject, index });
    });
    return [...this.tagOrder, 'OTHER']
      .filter(key => buckets.has(key))
      .map(key => ({ key, label: this.tagLabels[key] ?? 'Other Subjects', items: buckets.get(key)! }));
  }

  isSubjectComplete(subject: any): boolean {
    const tracks: any[] = subject?.subjectTracks ?? [];
    return tracks.length > 0 && tracks.every((t: any) => t.isCompleted);
  }

  getCompletedTracks(subject: any): number {
    return (subject?.subjectTracks ?? []).filter((t: any) => t.isCompleted).length;
  }

  getTotalTracks(subject: any): number {
    return subject?.subjectTracks?.length ?? 0;
  }

  getAllTracksCount(): number {
    return this._subjects.reduce((sum, s) => sum + (s.subjectTracks?.length ?? 0), 0);
  }

  // Journey Completed — average of each track's own progressPercent (topics
  // completed / total topics) rather than a binary "is the whole track done"
  // count, so the bar moves as soon as the user finishes any topic instead of
  // jumping only when an entire track is cleared.
  getSubjectProgress(subject: any): number {
    const tracks: any[] = subject?.subjectTracks ?? [];
    if (!tracks.length) return Math.round(subject?.coverage ?? 0);
    const sum = tracks.reduce((s: number, t: any) => s + (t.progressPercent ?? (t.isCompleted ? 100 : 0)), 0);
    return Math.round(sum / tracks.length);
  }

  // The curriculum API (fetchCourseDetail) does not send score/accuracy/attempted
  // on the subject itself — only on its subjectTracks. Roll those up so the
  // subject header shows real numbers instead of always reading 0. `subject?.x ??`
  // keeps this compatible if a future/other API response does send the field directly.
  private weightedAvg(tracks: any[], valueKey: string, weightKey: string): number {
    const totalWeight = tracks.reduce((s: number, t: any) => s + (t[weightKey] || 0), 0);
    if (!totalWeight) return 0;
    const sum = tracks.reduce((s: number, t: any) => s + (t[valueKey] || 0) * (t[weightKey] || 0), 0);
    return Math.round(sum / totalWeight);
  }

  getSubjectScore(subject: any): number {
    if (subject?.score) return subject.score;
    return this.weightedAvg(subject?.subjectTracks ?? [], 'score', 'numTrivia');
  }

  getSubjectAccuracy(subject: any): number {
    if (subject?.accuracy) return subject.accuracy;
    return this.weightedAvg(subject?.subjectTracks ?? [], 'accuracy', 'attempted');
  }

  getSubjectAttempted(subject: any): number {
    if (subject?.attempted) return subject.attempted;
    return (subject?.subjectTracks ?? []).reduce((s: number, t: any) => s + (t.attempted || 0), 0);
  }

  // Drives the zero-activity content swap (headline score, stat row) — true for anyone with real
  // attempts on this subject, false for a visitor or a fresh account that hasn't started yet.
  // Deliberately keyed off actual activity, not auth/enrollment state, since a logged-in learner
  // who hasn't touched this subject sees the same "nothing to show yet" reality as a visitor.
  hasActivity(subject: any): boolean {
    return this.getSubjectAttempted(subject) > 0;
  }

  // Ordinal so subject-level userLevel can be derived as "weakest track" — a
  // subject isn't genuinely Advanced while one of its tracks is still Beginner.
  private levelRank(level: string): number {
    const l = (level || '').toLowerCase();
    if (l.includes('expert') || l.includes('master') || l.includes('complete')) return 4;
    if (l.includes('advance')) return 3;
    if (l.includes('intermediate')) return 2;
    if (l.includes('beginner')) return 1;
    return 0;
  }

  // The API sends userLevel per track/topic, never on the subject itself —
  // roll it up as the lowest (least progressed) level among the subject's tracks.
  getSubjectUserLevel(subject: any): string {
    const tracks: any[] = subject?.subjectTracks ?? [];
    if (subject?.userLevel) return subject.userLevel;
    if (!tracks.length) return 'Not Started';
    return tracks.reduce((weakest: any, t: any) =>
      this.levelRank(t.userLevel) < this.levelRank(weakest.userLevel) ? t : weakest, tracks[0]).userLevel || 'Not Started';
  }

  getOverallProgress(): number {
    const total = this._subjects.reduce((sum, s) => sum + (s.subjectTracks?.length ?? 0), 0);
    if (!total) return 0;
    const done = this._subjects.reduce((sum, s) =>
      sum + (s.subjectTracks ?? []).filter((t: any) => t.isCompleted).length, 0);
    return Math.round((done / total) * 100);
  }

  onExploreSubject(subject: any): void { this.exploreSubject.emit(subject); }

  topicMeta(topic: any): { icon: string; color: string; bg: string } {
    if (topic?.isCompleted) return { icon: 'check', color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
    if (topic?.isStarted)   return { icon: 'schedule', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' };
    return { icon: '', color: '#64748b', bg: 'rgba(100,116,139,0.10)' };
  }

  // Same status scale used for skill grades elsewhere in the app (emerald/amber/red).
  performanceMeta(value: number): { color: string; bg: string } {
    if (value >= 80) return { color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
    if (value >= 50) return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
    if (value > 0)   return { color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
    return { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  }

  // userLevel is a *stage* (how far the user has progressed), not a *grade* —
  // deliberately a different color family than performanceMeta (blue→violet→emerald
  // progression) so a "Beginner" pill is never confused with a "bad score" red.
  userLevelMeta(level: string): { color: string; bg: string } {
    const l = (level || '').toLowerCase();
    if (l.includes('expert') || l.includes('master') || l.includes('complete'))
      return { color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
    if (l.includes('advance'))
      return { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' };
    if (l.includes('intermediate'))
      return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
    if (l.includes('beginner'))
      return { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' };
    return { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  }

  // Per-difficulty attempt/accuracy breakdown, shared by track- and topic-level
  // entities since both carry the same attempted/correctEasy|Medium|Hard fields.
  // Only tiers the user has actually attempted are meant to be rendered.
  difficultyStats(entity: any): { key: string; attempted: number; correct: number; accuracy: number }[] {
    const tiers = [
      { key: 'Easy',   attempted: entity?.attemptedEasy   || 0, correct: entity?.correctEasy   || 0 },
      { key: 'Medium', attempted: entity?.attemptedMedium || 0, correct: entity?.correctMedium || 0 },
      { key: 'Hard',   attempted: entity?.attemptedHard   || 0, correct: entity?.correctHard   || 0 },
    ];
    return tiers.map(t => ({ ...t, accuracy: t.attempted ? Math.round((t.correct / t.attempted) * 100) : 0 }));
  }

  hasDifficultyData(entity: any): boolean {
    return this.difficultyStats(entity).some(t => t.attempted > 0);
  }

  // Subject-level difficulty rollup — the API doesn't send this directly on the
  // subject, so sum it from the subject's own subjectTracks.
  subjectDifficultyStats(subject: any): { key: string; attempted: number; correct: number; accuracy: number }[] {
    const tracks: any[] = subject?.subjectTracks ?? [];
    const agg = { attemptedEasy: 0, correctEasy: 0, attemptedMedium: 0, correctMedium: 0, attemptedHard: 0, correctHard: 0 };
    tracks.forEach((t: any) => {
      agg.attemptedEasy   += t.attemptedEasy   || 0;
      agg.correctEasy     += t.correctEasy     || 0;
      agg.attemptedMedium += t.attemptedMedium || 0;
      agg.correctMedium   += t.correctMedium   || 0;
      agg.attemptedHard   += t.attemptedHard   || 0;
      agg.correctHard     += t.correctHard     || 0;
    });
    return this.difficultyStats(agg);
  }
}
