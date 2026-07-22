import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SubjectTrack, SubjectTrackTopic } from '@core/models/subject-dashboard.model';
import { RevealProgressDirective } from '@shared/directives/reveal-progress.directive';

// Same two-panel roadmap pattern as JobCurriculumComponent (job-role → subjects),
// one level down: subject → subjectTracks (left, always-visible stepper) →
// selected track's topics (right, full detail cards) — replaces the old
// grid-of-cards-with-a-collapse-toggle layout, which hid every topic by default.
@Component({
  selector: 'app-subject-curriculum',
  standalone: true,
  imports: [CommonModule, MatIconModule, RevealProgressDirective],
  templateUrl: './subject-curriculum.component.html',
  styleUrls: ['./subject-curriculum.component.scss'],
})
export class SubjectCurriculumComponent {
  private _tracks: SubjectTrack[] = [];

  @Input() set tracks(val: SubjectTrack[]) {
    this._tracks = val ?? [];
    this.selectedIdx = 0;
  }
  get tracks(): SubjectTrack[] { return this._tracks; }

  @Input() color = '#6366f1';
  // Gates every quiz trigger (topic + track level) and the per-topic performance
  // stats (Score/Accuracy/Correct-Wrong/Coverage) — a visitor or non-enrolled
  // learner can't take a quiz here, and repeated all-zero stat cards for content
  // they've never touched just reads as noise, not as a broken/empty state.
  @Input() isSubscribed = true;

  @Output() topicQuiz = new EventEmitter<any>();
  @Output() topicExplore = new EventEmitter<any>();
  @Output() trackQuiz = new EventEmitter<any>();

  selectedIdx = 0;

  get orderedTracks(): SubjectTrack[] {
    return [...this._tracks].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  selectTrack(idx: number): void {
    this.selectedIdx = idx;
  }

  isConnectorActive(idx: number): boolean {
    return this.selectedIdx === idx || this.selectedIdx === idx + 1;
  }

  getAllTopicsCount(): number {
    return this._tracks.reduce((sum, t) => sum + (t.topics?.length ?? 0), 0);
  }

  getOverallProgress(): number {
    const tracks = this.orderedTracks;
    if (!tracks.length) return 0;
    const sum = tracks.reduce((s, t) => s + (t.progressPercent ?? (t.isCompleted ? 100 : 0)), 0);
    return Math.round(sum / tracks.length);
  }

  // Same status scale used for skill grades elsewhere in the app (emerald/amber/red).
  performanceMeta(value: number): { color: string; bg: string } {
    if (value >= 80) return { color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
    if (value >= 50) return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
    if (value > 0) return { color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
    return { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  }

  // userLevel is a *stage*, not a *grade* — deliberately a different color family
  // (blue→violet→emerald) than performanceMeta so "Beginner" never reads as "bad score".
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

  // Per-difficulty attempt/accuracy breakdown — only tiers actually attempted
  // are meant to be rendered by the caller.
  difficultyStats(entity: any): { key: string; attempted: number; correct: number; accuracy: number }[] {
    const tiers = [
      { key: 'Easy', attempted: entity?.attemptedEasy || 0, correct: entity?.correctEasy || 0 },
      { key: 'Medium', attempted: entity?.attemptedMedium || 0, correct: entity?.correctMedium || 0 },
      { key: 'Hard', attempted: entity?.attemptedHard || 0, correct: entity?.correctHard || 0 },
    ];
    return tiers.map(t => ({ ...t, accuracy: t.attempted ? Math.round((t.correct / t.attempted) * 100) : 0 }));
  }

  hasDifficultyData(entity: any): boolean {
    return this.difficultyStats(entity).some(t => t.attempted > 0);
  }

  // journeyScore/journeyAccuracy are the structured learning-path metrics the
  // topic-level "Score"/"Accuracy" tiles are required to reflect — fall back to
  // the ad hoc quiz score/accuracy for any topic whose data doesn't carry them.
  topicScore(topic: SubjectTrackTopic): number {
    return topic.journeyScore ?? topic.journeyScore ?? 0;
  }

  topicAccuracy(topic: SubjectTrackTopic): number {
    return topic.journeyAccuracy ?? topic.journeyAccuracy ?? 0;
  }

  onTrackQuiz(track: SubjectTrack): void { this.trackQuiz.emit(track); }
  onTopicQuiz(topic: SubjectTrackTopic): void { this.topicQuiz.emit(topic); }
  onTopicExplore(topic: SubjectTrackTopic): void { this.topicExplore.emit(topic); }
}
