import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CourseProgressComponent } from '../course-progress/course-progress.component';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-subject-tracker-card',
  templateUrl: './subject-tracker-card.component.html',
  styleUrls: ['./subject-tracker-card.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButton,
    CourseProgressComponent
  ]
})
export class SubjectTrackerCardComponent {
  @Input() item: any;
  @Output() launchSubjectExplorer = new EventEmitter<any>();
  @Output() takeQuiz = new EventEmitter<any>();

  onViewPath() {
    this.launchSubjectExplorer.emit(this.item);
  }

  onTakeQuiz() {
    console.log("Emotting ", this.item);
    this.takeQuiz.emit(this.item);
  }
}