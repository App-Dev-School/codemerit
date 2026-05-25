import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-quiz-thumbnail',
  templateUrl: './quiz-thumbnail.component.html',
  styleUrls: ['./quiz-thumbnail.component.scss'],
   imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    FormsModule,
    MatIcon
  ],
})
export class QuizThumbnailComponent {
  @Input() quiz: any;

  takeQuiz(slug: string) {

  }
}
