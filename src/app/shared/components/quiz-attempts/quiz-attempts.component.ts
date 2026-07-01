import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-quiz-attempts',
  standalone: true,
  imports: [],
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
