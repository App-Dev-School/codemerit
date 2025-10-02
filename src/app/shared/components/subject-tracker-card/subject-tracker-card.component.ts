import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CourseProgressComponent } from '../course-progress/course-progress.component';
import { MatButton } from '@angular/material/button';
import { User } from '@core/models/user';

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
  @Input() user: User;
  @Output() launchSubjectExplorer = new EventEmitter<any>();
  @Output() takeQuiz = new EventEmitter<any>();

  getPercentage(count: number): number {
    const total = Number(this.item.numEasyTrivia) +
      Number(this.item.numIntTrivia) +
      Number(this.item.numAdvTrivia);
    return total > 0 ? (count / total) * 100 : 0;
  }

  getAttemptPercentage(count: number): number {
    const total = Number(this.item.attemptedEasy) +
      Number(this.item.attemptedMedium) +
      Number(this.item.attemptedHard);
    return total > 0 ? (count / total) * 100 : 0;
  }

  findUserLevel(){
    return this.getUserLevel(+this.item.numEasy, +this.item.numMedium, +this.item.numHard);
  }

  private getUserLevel(numEasy: number, numMedium: number, numHard: number): string {
    const max = Math.max(numEasy, numMedium, numHard);
    if (max === 0) return 'Unclassified';
    if (max === numHard) return 'Advanced';
    if (max === numMedium) return 'Intermediate';
    return 'Beginner';
  }

  onViewPath() {
    this.launchSubjectExplorer.emit(this.item);
  }

  onTakeQuiz() {
    this.takeQuiz.emit(this.item);
  }
}