import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RevealProgressDirective } from '@shared/directives/reveal-progress.directive';

@Component({
  selector: 'app-job-curriculum',
  standalone: true,
  imports: [CommonModule, MatIconModule, RevealProgressDirective],
  templateUrl: './job-curriculum.component.html',
  styleUrls: ['./job-curriculum.component.scss']
})
export class JobCurriculumComponent {

  private _subjects: any[] = [];

  @Input() set subjects(val: any[]) {
    this._subjects = val ?? [];
    this.selectedIdx = 0;
    this.tracksExpanded = false;
  }
  get subjects(): any[] { return this._subjects; }

  @Output() launchQuiz    = new EventEmitter<any>();
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

  getSubjectProgress(subject: any): number {
    const tracks: any[] = subject?.subjectTracks ?? [];
    if (!tracks.length) return Math.round(subject?.coverage ?? 0);
    const completed = tracks.filter((t: any) => t.isCompleted).length;
    return Math.round((completed / tracks.length) * 100);
  }

  getOverallProgress(): number {
    const total = this._subjects.reduce((sum, s) => sum + (s.subjectTracks?.length ?? 0), 0);
    if (!total) return 0;
    const done = this._subjects.reduce((sum, s) =>
      sum + (s.subjectTracks ?? []).filter((t: any) => t.isCompleted).length, 0);
    return Math.round((done / total) * 100);
  }

  onLaunchQuiz(subject: any): void     { this.launchQuiz.emit(subject); }
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
}
