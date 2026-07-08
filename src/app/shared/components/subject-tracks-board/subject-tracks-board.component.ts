import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SubjectTrack } from '@core/models/subject-dashboard.model';
import { SubjectTrackWidgetComponent } from '@shared/components/subject-track-widget/subject-track-widget.component';

@Component({
  selector: 'app-subject-tracks-board',
  imports: [CommonModule, SubjectTrackWidgetComponent],
  templateUrl: './subject-tracks-board.component.html',
  styleUrl: './subject-tracks-board.component.scss'
})
export class SubjectTracksBoardComponent {
  @Input() tracks: SubjectTrack[] = [];
  @Input() color = '#6366f1';

  @Output() topicQuiz = new EventEmitter<any>();
  @Output() topicExplore = new EventEmitter<any>();
  @Output() trackQuiz = new EventEmitter<any>();

  get orderedTracks(): SubjectTrack[] {
    return [...(this.tracks ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }
}
