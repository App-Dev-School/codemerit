
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { QuizResult } from '@core/models/quiz';
import { NgScrollbar } from 'ngx-scrollbar';
import { QuizProgressComponent } from '../quiz-progress/quiz-progress.component';
import { TopicsScore } from '../topic-wise-score/topics-score.component';

@Component({
  selector: 'app-quiz-result',
  templateUrl: './quiz-result.component.html',
  styleUrl: './quiz-result.component.scss',
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatButton,
    MatIcon,
    NgScrollbar,
    NgTemplateOutlet,
    TopicsScore,
    QuizProgressComponent
  ]
})
export class QuizResultComponent {
  @Input() result: QuizResult;
  @Output() onShareResult = new EventEmitter<string>();
  @Output() onContinue = new EventEmitter<string>();

  doOnShareResult() {
    this.onShareResult.emit("quizResultCard");
  }

  doOnContinue() {
    this.onContinue.emit("");
  }

   downloadReport() {
  }

  // Pass/fail helpers (minimal, safe access)
  get passMarks(): number {
    return (this.result?.quiz as any)?.settings?.passMarks ?? (this.result as any)?.passMarks ?? 60;
  }

  get isPassed(): boolean {
    const score = Number(this.result?.score ?? 0);
    return score >= this.passMarks;
  }

  get statusLabel(): string {
    return this.isPassed ? 'Passed' : 'Failed';
  }
}
