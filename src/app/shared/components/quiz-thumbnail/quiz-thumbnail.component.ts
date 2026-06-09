import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
    @Output() quizSelected = new EventEmitter<string>();
    @Output() viewAttempts = new EventEmitter<string>();

    takeQuiz(slug: string) {
        this.quizSelected.emit(slug);
    }

    viewResult(resultCode: string) {
        this.viewAttempts.emit(resultCode);
    }
}
