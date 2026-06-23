import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-quiz-attempts',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, NgClass],
  templateUrl: './quiz-attempts.component.html',
  styleUrls: ['./quiz-attempts.component.scss']
})
export class QuizAttemptsComponent  {
  @Input() questions: Array<any> = [];
 
  getStatusLabel(question: any): string {
    if (question.isSkipped === true) {
      return 'Skipped';
    }
    return question.isCorrect === 1 ? 'Correct' : 'Wrong';
  }

  getStatusClass(question: any): { [key: string]: boolean } {
    return {
      'status-correct': question.isCorrect === 1,
      'status-wrong': question.isCorrect === 0 && question.isSkipped !== 1,
      'status-skipped': question.isSkipped === 1,
    };
  }
}
