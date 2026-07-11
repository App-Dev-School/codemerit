import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CourseProgressComponent } from '../course-progress/course-progress.component';
import { User } from '@core/models/user';

@Component({
  selector: 'app-subject-tracker-card',
  templateUrl: './subject-tracker-card.component.html',
  styleUrls: ['./subject-tracker-card.component.scss'],
  imports: [
    CommonModule,
    CourseProgressComponent
  ]
})
export class SubjectTrackerCardComponent {
  @Input() item: any;
  @Input() user: User;
  @Input() profileMode = false;
  @Output() launchSubjectExplorer = new EventEmitter<any>();
  @Output() takeQuiz = new EventEmitter<any>();

  get completedTracksCount(): number {
    return (this.item?.subjectTracks ?? []).filter((t: any) => t.isCompleted).length;
  }

  onViewPath() {
    this.launchSubjectExplorer.emit(this.item);
  }

  onTakeQuiz() {
    this.takeQuiz.emit(this.item);
  }
}
