import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-quiz-question',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatChip, MatChipSet,
    CommonModule,
  ],
  templateUrl: './quiz-question.component.html',
  styleUrl: './quiz-question.component.scss',
})
export class QuizQuestionComponent {
@Input() question: any;
}
