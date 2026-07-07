import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-job-curriculum',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './job-curriculum.component.html',
  styleUrls: ['./job-curriculum.component.scss']
})
export class JobCurriculumComponent {

  private _subjects: any[] = [];

  @Input() set subjects(val: any[]) {
    this._subjects = val ?? [];
    this.selectedIdx = 0;
  }
  get subjects(): any[] { return this._subjects; }

  @Output() launchQuiz    = new EventEmitter<any>();
  @Output() exploreSubject = new EventEmitter<any>();

  selectedIdx = 0;

  selectSubject(idx: number): void { this.selectedIdx = idx; }

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
}
