import { CommonModule, JsonPipe, NgClass } from '@angular/common';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';

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
    NgScrollbar,
    SafePipe,
    CdTimerModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressBarModule,
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
  answerActive = false;
  currentQuestion: QuizQuestion;
  currentHint = '';
  onSelectionPhase = false;
  showWarningToast = false;
  userData: User;
  scheduledAutoNext: any;
  celebrationTrigger: { x: number; y: number } | null = null;

  @ViewChild('swiperEx') swiperEx!: ElementRef<{ swiper: Swiper }>;
  displayingAuthDialog = false;
  quizConfig: QuizConfig;

  // ---------------- Question Timer Variables ----------------
  questionTimeLeft: number = 0;
  questionTimerInterval: any;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private utility: UtilsService,
    private snackBar: MatSnackBar,
    private quizService: QuizService
  ) {
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

  
  getQuestionLevel(level: number): string {
  switch(level) {
    case 0: return 'Easy';
    case 1: return 'Intermediate';
    case 2: return 'Advanced';
    default: return 'Unknown';
  }
}
getLevelClass(level: number): string {
    switch(level) {
      case 0: return 'easy-level';
      case 1: return 'intermediate-level';
      case 2: return 'advanced-level';
      default: return '';
    }
  }


  private loadQuiz(): void {
    this.quizService.getQuiz(this.quizSlug)
      .subscribe(data => {
        this.quiz = data;
        this.loadingText = 'Almost Ready';
        this.loading = false;
        this.questions = (data.questions || []).map(q => ({
          ...q,
          options: q.options || [],
          selectedChoice: '',
          topicsArr: q.topics ? q.topics.map(object => object.title) : []
        }));
        if (this.questions.length) {
          this.startQuestionTimer(this.questions[0]);
        }
      });
  }

  // ---------------- Question Timer Logic ----------------
  startQuestionTimer(question: QuizQuestion) {
    // Clear previous timer
    if (this.questionTimerInterval) {
      clearInterval(this.questionTimerInterval);
    }

    // Initialize time left for the current question
    this.questionTimeLeft = question.timeAllowed || 30; // default 30s if not set

    this.questionTimerInterval = setInterval(() => {
      this.questionTimeLeft--;

      // Show warning if 10s left
      if (this.questionTimeLeft === 10) {
        this.showWarningToast = true;
        setTimeout(() => {
          this.showWarningToast = false;
          this.warningActive = true;
        }, 1000);
      }

      // Auto move to next question if timer ends
      if (this.questionTimeLeft <= 0) {
        clearInterval(this.questionTimerInterval);
        this.onSlideNext();
      }
    }, 1000);
  }

  // ---------------- Navigation ----------------
  optionSelected($event: MouseEvent, choice: number, question: QuizQuestion): void {
    this.authService.log('Quiz optionSelected', choice, question);
    if (!question.hasAnswered) {
      this.onSelectionPhase = true;
      question.selectedOption = choice;
      question.hasAnswered = true;
    }
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

  onSlideNext(): void {
    if (this.currentQuestionId < this.questions.length - 1) {
      this.swiperEx.nativeElement.swiper.slideNext();
      this.updateCurrentIndex();
      this.startQuestionTimer(this.questions[this.currentQuestionId]);
    } else {
      if (this.quizConfig.enableAudio)
        this.quizHelper.playSound('well-done');
      this.completeQuiz();
    }
    //clear any previous scheduled task
    clearTimeout(this.scheduledAutoNext);
  }

  onSlidePrev(): void {
    if (this.currentQuestionId > 0) {
      this.swiperEx.nativeElement.swiper.slidePrev();
      this.updateCurrentIndex();
      this.startQuestionTimer(this.questions[this.currentQuestionId]);
    }
  }

  private completeQuiz(): void {
    clearInterval(this.questionTimerInterval);
    this.submitQuiz();
  }

  private updateCurrentIndex(): void {
    this.currentQuestionId = this.swiperEx.nativeElement.swiper.activeIndex;
    const currentQuestion = this.questions[this.currentQuestionId];
    this.currentQuestion = currentQuestion;
  }

  submitQuiz() {
    clearInterval(this.questionTimerInterval);
    this.loading = true;
    this.loadingText = 'Submitting Quiz';
    const analytics = this.quizService.processAndSaveResults(this.questions, this.quiz.id);
    this.quizService.submitQuiz(analytics).subscribe(
      (data: any) => {
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

  // ---------------- Hint & Celebration ----------------
  showHint(): void {
    const currentQuestion = this.questions[this.currentQuestionId];
    if (currentQuestion?.hint) {
      this.currentHint = currentQuestion?.hint;
      currentQuestion.hintUsed = true;
      if (currentQuestion?.answer) {
        this.currentHint = 'ANSWER : ' + currentQuestion?.answer;
        currentQuestion.hintUsed = true;
      }
    } else {
      this.currentHint = 'Hint not available';
    }
    this.hintActive = true;
  }

  hideHint() {
    this.hintActive = false;
    this.currentHint = '';
  }

  isCodeQuestion(text: string): boolean {
    return this.utility.isCodeQuestion(text);
  }

  quickRegister() {
    this.displayingAuthDialog = true;
    const dialogRef = this.dialog.open(LoginFormComponent, {
      width: 'auto',
      height: 'auto',
      maxWidth: '480px',
      data: {
        title: 'Your Attempts are saved',
        message: 'Quick register to submit your assessment and generate report.',
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
        y: event.clientY - rect.height / 2
      };
    } catch (error) {
      console.log("optionSelected() triggerCelebration error", error);
    }
  }

  onCelebrationFinished() {
    console.log('🎉 Celebration animation completed!');
  }
}
