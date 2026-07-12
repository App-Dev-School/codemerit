import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SubjectTrack, SubjectTrackTopic } from '@core/models/subject-dashboard.model';

const LEVEL_ORDER = ['Foundation', 'Intermediate', 'Advanced'];

@Component({
  selector: 'app-subject-track-widget',
  imports: [CommonModule],
  templateUrl: './subject-track-widget.component.html',
  styleUrl: './subject-track-widget.component.scss'
})
export class SubjectTrackWidgetComponent {
  @Input() track!: SubjectTrack;
  @Input() color = '#6366f1';
  @Input() index = 0;

  @Output() topicQuiz = new EventEmitter<any>();
  @Output() topicExplore = new EventEmitter<any>();
  @Output() trackQuiz = new EventEmitter<any>();

  isExpanded = false;

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  get questionsToGo(): number {
    return Math.max((this.track?.numTrivia ?? 0) - (this.track?.attempted ?? 0), 0);
  }

  get trackLevels(): string[] {
    const present = new Set((this.track?.topics ?? []).map(t => t.label).filter(Boolean));
    const ordered = LEVEL_ORDER.filter(l => present.has(l));
    const extras = [...present].filter(l => !LEVEL_ORDER.includes(l));
    return [...ordered, ...extras];
  }

  levelMeta(level: string): { color: string; bg: string } {
    const l = (level || '').toLowerCase();
    if (l.includes('expert') || l.includes('master') || l.includes('complete'))
      return { color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
    if (l.includes('proficient') || l.includes('advance'))
      return { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' };
    if (l.includes('intermediate'))
      return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
    if (l.includes('beginner'))
      return { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' };
    return { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  }

  levelChipClasses(label: string): string {
    const key = (label || '').toLowerCase();
    if (key.includes('found') || key.includes('basic') || key.includes('beginner')) {
      return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
    }
    if (key.includes('inter') || key.includes('mid')) {
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
    }
    if (key.includes('adv')) {
      return 'bg-cm-surface-raised text-cm-text-secondary border-cm-border-strong';
    }
    return 'bg-cm-surface-raised text-cm-text-muted border-cm-border';
  }

  onTrackQuiz(): void {
    this.trackQuiz.emit(this.track);
  }

  onTopicQuiz(topic: SubjectTrackTopic): void {
    this.topicQuiz.emit(topic);
  }

  onTopicExplore(topic: SubjectTrackTopic): void {
    this.topicExplore.emit(topic);
  }
}
