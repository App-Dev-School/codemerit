import { CommonModule, NgClass } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { QuizQuestion } from '@core/models/quiz-question';
import { CdTimerComponent, CdTimerModule } from 'angular-cd-timer';
import { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';
import { QuizService } from '../quiz.service';
import { User } from '@core/models/user';
import { AuthService } from '@core/service/auth.service';
import { CreateQuizResponse, QuizEntity } from '@core/models/dtos/GenerateQuizDto';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UtilsService } from '@core/service/utils.service';
import { SafePipe } from '@shared/pipes/safehtml.pipe';
import { CelebrationComponent } from '@shared/components/celebration/celebration.component';
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
    SafePipe,
    CdTimerModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    CelebrationComponent
  ]
})
export class TakeQuizComponent implements OnInit, AfterViewInit {
  quiz!: QuizEntity;
  questions: QuizQuestion[] = [];
  currentQuestionId = 0;
  loading = true;
  loadingText = 'Launching Quiz';
  quizSlug = '';
  completed = false;
  quizResult: any;
  quizDuration = 180;
  @ViewChild('timerRef', { static: false }) timer: CdTimerComponent;
  warningActive = false;
  hintActive = false;
  currentHint = '';
  showWarningToast = false;
  userData: User;
  celebrationTrigger: { x: number; y: number } | null = null;

  @ViewChild('swiperEx') swiperEx!: ElementRef<{ swiper: Swiper }>;

  constructor(private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private utility: UtilsService,
    private snackBar: MatSnackBar,
    private quizService: QuizService) {
    register(); // Register Swiper web components
  }

  ngOnInit(): void {
    this.userData = this.authService.currentUserValue;
    this.quizSlug = this.route.snapshot.paramMap.get('qcode');
    if (this.quizSlug) {
      this.loadQuiz();
    } else {
      this.authService.redirectToErrorPage();
    }
  }

  ngAfterViewInit(): void {
    // Swiper is automatically initialized via web component
  }

  /** Load quiz from local JSON */
  private loadQuiz(): void {
    this.quizService.getQuiz(this.quizSlug)
      .subscribe(data => {
        this.quiz = data;
        this.loadingText = 'Almost Ready';
        this.loading = false;
        console.log("QuizPlayer Loaded Quiz", data);
        this.questions = (data.questions || []).map(q => ({
          ...q,
          options: q.options || [],
          selectedChoice: '',
          topicsArr: q.topics ? q.topics.map(object => object.title) : []
        }));
        console.log("QuizPlayer Transformed Loaded Questions", this.questions);
      });
  }

  /** Record selected answer */
  optionSelected($event: MouseEvent, choice: number, question: QuizQuestion): void {
    this.authService.log('Quiz optionSelected', choice, question);
    if (!question.hasAnswered) {
      question.selectedOption = choice;
      question.hasAnswered = true;
    }
    //console.log("optionSelected() =>", choice, question);
    const isCorrect = question.options.some(
      opt => opt.id === question.selectedOption && (opt.correct === true)
    );
    if (isCorrect) {
      this.triggerCelebration($event);
    }
    setTimeout(() => {
        this.onSlideNext();
    }, isCorrect ? 2200 : 1200);
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
      this.currentHint = currentQuestion?.hint;
      currentQuestion.hintUsed = true;
      //remove this and implement in interactive mode
      if (currentQuestion?.answer) {
        this.currentHint = 'ANSWER : ' + currentQuestion?.answer;
        currentQuestion.hintUsed = true;
      }
    } else {
      this.currentHint = 'Hint not available';
    }
    this.hintActive = true;
    // setTimeout(() => {
    //   this.hintActive = false;
    // }, 3000);
  }

  hideHint() {
    this.hintActive = false;
    this.currentHint = '';
  }

  onTick(event: any) {
    if (event.minutes === 1 && event.seconds === 0) {
      this.showWarningToast = true;
      //this.timer.stop();
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        this.warningActive = true;
        this.showWarningToast = false;
        //this.timer.start();
      }, 3000);
    }
  }

  onTimerComplete() {
    console.log('Timer finished!');
    this.warningActive = false;
    this.showWarningToast = false;
    console.log('Quiz Timed Out!', this.questions);
    this.submitQuiz();
  }

  private completeQuiz(): void {
    console.log('Quiz complete!', this.questions);
    this.submitQuiz();
  }

  private updateCurrentIndex(): void {
    this.currentQuestionId = this.swiperEx.nativeElement.swiper.activeIndex;
  }

  submitQuiz() {
    console.log("QuizPlayer submitQuiz() called", this.questions);
    this.loading = true;
    this.loadingText = 'Submitting Quiz';
    const analytics = this.quizService.processAndSaveResults(this.questions, this.quiz.id);
    this.quizService.submitQuiz(analytics).subscribe(
      (data: any) => {
        console.log("QuizPlayer Quiz", data);
        this.quizResult = data.data;
        setTimeout(() => {
          this.completed = true;
          this.navigateToResult(this.quizResult.resultCode);
        }, 2000);
      }, (error: any) => {
        this.showNotification(
          "snackbar-danger",
          error,
          "bottom",
          "center"
        );
      }
    );
  }

  isCodeQuestion(text: string): boolean {
    return this.utility.isCodeQuestion(text);
  }

  showNotification(colorName, text, placementFrom, placementAlign) {
    this.snackBar.open(text, "", {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName
    });
  }

  navigateToResult(resultCode: string) {
    this.router.navigate(['quiz/result', resultCode]);
  }

  triggerCelebration(event: MouseEvent) {
    try {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      this.celebrationTrigger = {
        x: event.clientX,
        y: event.clientY - rect.height / 2 // slightly above click
      };
    } catch (error) {
      console.log("optionSelected() triggerCelebration error", error);
    }
  }

  onCelebrationFinished() {
    console.log('🎉 Celebration animation completed!');
    //this.onSlideNext();
  }

}