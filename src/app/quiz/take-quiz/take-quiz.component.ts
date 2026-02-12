import { CommonModule, NgClass } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
import { QuizCreateComponent } from '@shared/components/quiz-create/quiz-create.component';
import { SafePipe } from '@shared/pipes/safehtml.pipe';
import { CdTimerComponent, CdTimerModule } from 'angular-cd-timer';
import { NgScrollbar } from 'ngx-scrollbar';
import { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';
import { QuizHelperService } from '../quiz-helper.service';
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
  quizDuration = 300;
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
  // -- Question Timer Variables
  questionTimeLeft: number = 0;
  questionTimerInterval: any;
  allowOptionClick = false;

  constructor(private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private utility: UtilsService,
    private snackBar: MatSnackBar,
    private quizService: QuizService,
    private quizHelper: QuizHelperService) {
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

  private loadQuiz(): void {
    this.quizService.getQuiz(this.quizSlug)
      .subscribe(data => {
        this.quiz = data;
        this.loadingText = 'Loading Assessment Panel';
        this.questions = (data.questions || []).map(q => ({
          ...q,
          options: q.options || [],
          selectedChoice: '',
          topicsArr: q.topics ? q.topics.map(object => object.title) : []
        }));
        this.currentQuestion = this.questions[this.currentQuestionId];
        this.quizDuration = this.questions.reduce((sum, q) => sum + (q.timeAllowed || 0), 0);
        console.log("QuizPlayer Transformed Loaded Questions", this.questions);
        //#Task2: Done Once all quiz questions are loaded , calculate the sum of timeAllowed for each question
        //set that time as the quiz time
        if (this.questions.length) {
          this.startQuestionTimer(this.questions[0]);
          this.disableOptionClickTemporarily();
        }
        setTimeout(() => {
          this.loading = false;
        }, 3000);
      });
  }

  startQuestionTimer(question: QuizQuestion) {
    // Clear previous timer
    if (this.questionTimerInterval) {
      clearInterval(this.questionTimerInterval);
      this.onTimerComplete();
    }

    // Initialize time left for the current question
    this.questionTimeLeft = question.timeAllowed || 30; // default 30s if not set

    this.questionTimerInterval = setInterval(() => {
      this.questionTimeLeft--;

      // Show warning if 10s left
      if (this.questionTimeLeft === 10) {
        this.showWarningToast = true;
        this.warningActive = true;
        setTimeout(() => {
          this.showWarningToast = false;
        }, 1000);
      }

      // Auto move to next question if timer ends
      if (this.questionTimeLeft <= 0) {
        clearInterval(this.questionTimerInterval);
        this.onSlideNext();
      }
    }, 1000);
  }

  /** Record selected answer */
  optionSelected($event: MouseEvent, choice: number, question: QuizQuestion): void {
    if (!question.hasAnswered) {
      if (!this.allowOptionClick) {
        this.snackBar.open('Please read the question before attempting.', '', {
          duration: 1500,
          panelClass: ['snackbar-warning']
        });
        return;
      }

      this.onSelectionPhase = true;
      question.selectedOption = choice;
      question.hasAnswered = true;

      //console.log("optionSelected() =>", choice, question);
      const isCorrect = question.options.some(
        opt => opt.id === question.selectedOption && (opt.correct === true)
      );
      //#Task5: Show celebration only for special questions
      if (this.quizConfig.mode === 'Interactive' && isCorrect && question.marks > 1) {
        this.triggerCelebration($event);
      }
      this.scheduledAutoNext = setTimeout(() => {
        this.onSlideNext();
        this.onSelectionPhase = false;
      }, isCorrect ? 1600 : 1200);
      //playsound
      if (this.quizConfig.enableAudio) {
        if (isCorrect)
          this.quizHelper.playSound('right_answer');
        else
          this.quizHelper.playSound('wrong_answer');
      }
    }
  }

  /** Navigate to next question */
  onSlideNext(): void {
    this.warningActive = false;
    if (this.currentQuestionId < this.questions.length - 1) {
      this.swiperEx.nativeElement.swiper.slideNext();
      this.updateCurrentIndex();
      this.disableOptionClickTemporarily();
      this.startQuestionTimer(this.questions[this.currentQuestionId]);
      if (this.quizConfig.enableAudio)
        this.quizHelper.playSound('click');
    } else {
      if (this.quizConfig.enableAudio)
        this.quizHelper.playSound('well-done');
      this.completeQuiz();
    }
    //clear any previous scheduled task
    clearTimeout(this.scheduledAutoNext);
  }

  /** Navigate to previous question */
  onSlidePrev(): void {
    this.warningActive = false;
    if (this.currentQuestionId > 0) {
      this.swiperEx.nativeElement.swiper.slidePrev();
      this.updateCurrentIndex();
      this.disableOptionClickTemporarily();
      this.startQuestionTimer(this.questions[this.currentQuestionId]);
      //clear any previous scheduled task
      clearTimeout(this.scheduledAutoNext);
    }
  }

  private disableOptionClickTemporarily(): void {
    this.allowOptionClick = false;
    // Allow clicking only after 5 seconds
    setTimeout(() => {
      this.allowOptionClick = true;
    }, 3000);
  }

  showHint(): void {
    if (this.currentQuestion?.hint) {
      this.currentHint = this.currentQuestion?.hint;
      this.currentQuestion.hintUsed = true;
      if (this.quizConfig.enableAudio)
        this.quizHelper.playSound('ping');
    } else {
      this.currentHint = 'Hint not available';
    }
    this.hintActive = true;
  }

  showAnswers(): void {
    if (this.currentQuestion?.answer) {
      this.currentQuestion.answerSeen = true;
      if (this.quizConfig.enableAudio)
        this.quizHelper.playSound('ping');
    }
    this.answerActive = true;
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
    this.warningActive = false;
    this.showWarningToast = false;
    if (this.quizConfig.enableAudio)
      this.quizHelper.playSound('click');
    console.log('Quiz Timed Out!', this.questions);
    //this.submitQuiz();
    //this is a question level timer
  }

  private completeQuiz(): void {
    console.log('Quiz complete!', this.questions);
    this.submitQuiz();
  }

  private updateCurrentIndex(): void {
    this.currentQuestionId = this.swiperEx.nativeElement.swiper.activeIndex;
    const currentQuestion = this.questions[this.currentQuestionId];
    this.currentQuestion = currentQuestion;
  }

  submitQuiz() {
    console.log("QuizPlayer submitQuiz() with user", this.authService.currentUserValue);
    clearInterval(this.questionTimerInterval);
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
    this.displayingAuthDialog = true;
    const dialogRef = this.dialog.open(LoginFormComponent, {
      width: 'auto',
      height: 'auto',
      maxWidth: '480px',
      data: {
        title: 'Your Attempts are saved',
        message: 'Login/ Register to submit your assessment.',
        action: 'Exit this Assessment'
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log("Take Quiz QuickAuth Complete", result);
      this.displayingAuthDialog = false;
      if (result && result?.id) {
        this.showNotification(
          'snackbar-danger',
          (result?.isNewUser) ? 'Quick Registration Complete.' : 'Welcome back ' + (result?.firstName),
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
  }

  getQuestionLevel(level: number): string {
    switch (level) {
      case 1: return 'Easy';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      default: return 'Unknown';
    }
  }
  getLevelClass(level: number): string {
    switch (level) {
      case 1: return 'col-indigo';
      case 2: return 'col-purple';
      case 3: return 'bg-brown';
      default: return '';
    }
  }

  openSettingsDialog() {
      const dialogRef = this.dialog.open(QuizCreateComponent, {
      width: '60vw',
      height: 'auto',
      minWidth: '345px',
        data: {
          editMode: true,
          title: 'Select your preference',
          message: ''
        },
        hasBackdrop: true,
        autoFocus: true,
        disableClose: true
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.quizConfig = this.quizService.getQuizConfig();
          console.log("QuizPlayer QuizConfig updated", this.quizConfig);
        }
      });
    }
}