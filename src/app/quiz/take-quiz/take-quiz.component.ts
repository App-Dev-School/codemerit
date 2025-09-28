import { CommonModule, NgClass } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizEntity } from '@core/models/dtos/GenerateQuizDto';
import { QuizQuestion } from '@core/models/quiz-question';
import { User } from '@core/models/user';
import { AuthService } from '@core/service/auth.service';
import { UtilsService } from '@core/service/utils.service';
import { CelebrationComponent } from '@shared/components/celebration/celebration.component';
import { LoginFormComponent } from '@shared/components/login-form/login-form.component';
import { SafePipe } from '@shared/pipes/safehtml.pipe';
import { CdTimerComponent, CdTimerModule } from 'angular-cd-timer';
import { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';
import { QuizConfig, QuizService } from '../quiz.service';
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
  quizDuration = 300;
  @ViewChild('timerRef', { static: false }) timer: CdTimerComponent;
  warningActive = false;
  hintActive = false;
  answerActive = false;
  currentQuestion : QuizQuestion;
  currentHint = '';
  showWarningToast = false;
  userData: User;
  scheduledAutoNext: any;
  celebrationTrigger: { x: number; y: number } | null = null;

  @ViewChild('swiperEx') swiperEx!: ElementRef<{ swiper: Swiper }>;
  displayingAuthDialog = false;
  quizConfig: QuizConfig;

  constructor(private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private utility: UtilsService,
    private snackBar: MatSnackBar,
    private quizService: QuizService) {
    register(); // Register Swiper web components
  }

  ngOnInit(): void {
    this.userData = this.authService.currentUserValue;
    this.quizSlug = this.route.snapshot.paramMap.get('qcode');
    this.quizConfig = this.quizService.getQuizConfig();
    console.log("QuizPlayer Loaded QuizConfig", this.quizConfig);
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
        this.loadingText = 'Loading Assessment Panel';
        console.log("QuizPlayer Loaded Quiz", data);
        this.questions = (data.questions || []).map(q => ({
          ...q,
          options: q.options || [],
          selectedChoice: '',
          topicsArr: q.topics ? q.topics.map(object => object.title) : []
        }));

        this.quizDuration = this.questions.reduce((sum, q) => sum + (q.timeAllowed || 0), 0);
        console.log("QuizPlayer Transformed Loaded Questions", this.questions);
        //#Task2: Done Once all quiz questions are loaded , calculate the sum of timeAllowed for each question
        //set that time as the quiz time
        setTimeout(() => {
          this.loading = false;
        }, 3000);
      });
  }

  /** Record selected answer */
  optionSelected($event: MouseEvent, choice: number, question: QuizQuestion): void {
    this.authService.log('Quiz optionSelected', choice, question);
    if (!question.hasAnswered) {
      question.selectedOption = choice;
      question.hasAnswered = true;

      //console.log("optionSelected() =>", choice, question);
      const isCorrect = question.options.some(
        opt => opt.id === question.selectedOption && (opt.correct === true)
      );
      //#Task5: Show celebration only for special questions
      if (isCorrect && question.marks > 1) {
        this.triggerCelebration($event);
      }
      this.scheduledAutoNext = setTimeout(() => {
        this.onSlideNext();
      }, isCorrect ? 2000 : 1200);
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
    //clear any previous scheduled task
    clearTimeout(this.scheduledAutoNext);
  }

  /** Navigate to previous question */
  onSlidePrev(): void {
    if (this.currentQuestionId > 0) {
      this.swiperEx.nativeElement.swiper.slidePrev();
      this.updateCurrentIndex();
      //clear any previous scheduled task
      clearTimeout(this.scheduledAutoNext);
    }
  }

  showHint(): void {
    const currentQuestion = this.questions[this.currentQuestionId];
    this.currentQuestion = currentQuestion;
    //currently show naswer
    if (currentQuestion?.hint) {
      this.currentHint = this.currentQuestion?.hint;
      currentQuestion.hintUsed = true;
    } else {
      this.currentHint = 'Hint not available';
    }
    this.hintActive = true;
  }

  showAnswers(): void {
    this.currentQuestion = this.questions[this.currentQuestionId];
    if (this.currentQuestion?.answer) {
      this.currentQuestion.answerSeen = true;
      this.answerActive = true;
    }
  }

  hideHint() {
    this.hintActive = false;
    this.currentHint = '';
  }

   hideAnswer() {
    this.answerActive = false;
    //this.currentHint = '';
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
    console.log("QuizPlayer submitQuiz() with user", this.authService.currentUserValue);
    if (!(this.authService.currentUserValue && this.authService.currentUserValue.email)) {
      //#Task1: Display Signup/login option as dialog
      //Use existing signin / signup component and display them as a dialog
      if (!this.displayingAuthDialog) {
        this.quickRegister();
      }
      return;
    }
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

  quickRegister() {
    console.log("quickRegister called");
    this.displayingAuthDialog = true;
    const dialogRef = this.dialog.open(LoginFormComponent, {
      width: 'auto',
      height: 'auto',
      maxWidth: '480px',
      data: {
        title: 'Your Attempts will be submitted',
        message: 'Quick register with your name and e-mail to generate your assessment report.',
        action: 'Exit this Assessment'
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log("Take Quiz should receive userID", result);
      this.displayingAuthDialog = false;
      if (result && result?.id) {
        this.showNotification(
          'snackbar-danger',
          'Quick Registration Complete.',
          'bottom',
          'center'
        );
        //if userID received submit the Quiz
        if (!this.quizResult) {
          console.log("Submitted again", this.authService.currentUserValue);
          this.submitQuiz();
        }
      }
    });
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