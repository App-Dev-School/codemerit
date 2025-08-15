import { CommonModule, NgClass } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CdTimerModule } from 'angular-cd-timer';
import { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';
import { QuizService } from '../quiz.service';
import { QuizQuestion } from '@core/models/quiz-question';
interface Quiz {
  title: string;
  subject_icon: string;
  questions: QuizQuestion[];
}

@Component({
  selector: 'app-take-quiz',
  templateUrl: './take-quiz.component.html',
  styleUrls: ['./take-quiz.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    NgClass,
    CdTimerModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class TakeQuizComponent implements OnInit, AfterViewInit {
  quiz!: Quiz;
  questions: QuizQuestion[] = [];
  currentQuestionId = 0;

  @ViewChild('swiperEx') swiperEx!: ElementRef<{ swiper: Swiper }>;

  constructor(private quizService: QuizService) {
    register(); // Register Swiper web components
  }

  ngOnInit(): void {
    this.loadQuiz();
  }

  ngAfterViewInit(): void {
    // Swiper is automatically initialized via web component
  }

  /** Load quiz from local JSON */
  private loadQuiz(): void {
    this.quizService.getQuiz(1)
      .subscribe(data => {
        this.quiz = data;
        // Ensure each question has a selectedChoice field
        this.questions = (data.questions || []).map(q => ({
          ...q,
          choices: q.choices || [],
          selectedChoice: ''
        }));
      });
  }

  /** Record selected answer */
  optionSelected(choice: string, question: QuizQuestion): void {
    if (!question.hasAnswered) {
      question.selectedChoice = choice;
      question.hasAnswered = true;
    }
  }

  /** Navigate to next question */
  onSlideNext(): void {
    if (this.currentQuestionId < this.questions.length - 1) {
      this.swiperEx.nativeElement.swiper.slideNext();
      this.updateCurrentIndex();
    } else {
      this.completeQuiz();
    }
  }

  /** Navigate to previous question */
  onSlidePrev(): void {
    if (this.currentQuestionId > 0) {
      this.swiperEx.nativeElement.swiper.slidePrev();
      this.updateCurrentIndex();
    }
  }

  /** Called when a hint is requested */
  showHint(): void {
    const currentQuestion = this.questions[this.currentQuestionId];
    if (currentQuestion?.hint) {
      currentQuestion.usedHint = true;
      alert(`Hint: ${currentQuestion.hint}`);
    } else {
      alert('No hint available for this question.');
    }
  }

  /** Handle end of quiz */
  private completeQuiz(): void {
    console.log('Quiz complete!', this.questions);
    this.submitQuiz();
  }


  /** Update current index from Swiper */
  private updateCurrentIndex(): void {
    this.currentQuestionId = this.swiperEx.nativeElement.swiper.activeIndex;
  }

  submitQuiz() {
    this.quizService.processAndSaveResults(this.questions, 'quiz-angular-101', 'user-123');
  }
}