import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';

@Component({
  selector: 'app-quiz-attempts',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, NgClass],
  templateUrl: './quiz-attempts.component.html',
  styleUrls: ['./quiz-attempts.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class QuizAttemptsComponent implements AfterViewInit {
  @Input() questions: Array<any> = [];
  @ViewChild('swiperEx') swiperEx!: ElementRef<{ swiper: Swiper }>;
  currentQuestionId = 0;

  constructor() {
    register();
  }

  ngAfterViewInit(): void {
    if (this.questions?.length) {
      this.currentQuestionId = 0;
    }
  }

  private updateCurrentIndex(): void {
    if (this.swiperEx?.nativeElement?.swiper) {
      this.currentQuestionId = this.swiperEx.nativeElement.swiper.activeIndex;
    }
  }

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
