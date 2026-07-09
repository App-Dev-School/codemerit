import { CommonModule, NgClass } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizEntity } from '@core/models/dtos/GenerateQuizDto';
import { QuizQuestion } from '@core/models/quiz-question';
import { User } from '@core/models/user';
import { AuthService } from '@core/service/auth.service';
import { UtilsService } from '@core/service/utils.service';
import { CelebrationComponent } from '@shared/components/celebration/celebration.component';
import { LoginFormComponent } from '@shared/components/login-form/login-form.component';
import { QuizCreateComponent } from '@shared/components/quiz-create/quiz-create.component';
import { NgScrollbar } from 'ngx-scrollbar';
import { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';
import { QuizHelperService } from '../quiz-helper.service';
import { QuizConfig, QuizService } from '../quiz.service';
import { SpeechService } from '@core/service/speech.service';

interface FeedbackState {
  show: boolean;
  isCorrect: boolean;
  isTimeout: boolean;
  marks: number;
  answer: string;
  rewardMsgIdx: number;
  autoIn: number;
  autoInTotal: number;
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
    CelebrationComponent,
  ],
})
export class TakeQuizComponent implements OnInit, AfterViewInit {
  private subscriptions: any[] = [];
  private destroyed = false;

  quiz!: QuizEntity;
  questions: QuizQuestion[] = [];
  currentQuestionId = 0;
  loading = true;
  loadingText = 'Launching Quiz';
  quizSlug = '';
  completed = false;
  quizResult: any;
  quizDuration = 300;

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

  questionTimeLeft = 0;
  questionTimerInterval: any;
  feedbackTimerInterval: any;
  allowOptionClick = false;

  feedback: FeedbackState = {
    show: false,
    isCorrect: false,
    isTimeout: false,
    marks: 0,
    answer: '',
    rewardMsgIdx: 0,
    autoIn: 0,
    autoInTotal: 0,
  };

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private utility: UtilsService,
    private snackBar: MatSnackBar,
    private quizService: QuizService,
    private quizHelper: QuizHelperService,
    private speech: SpeechService
  ) {
    register();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.questionTimerInterval) clearInterval(this.questionTimerInterval);
    if (this.feedbackTimerInterval) clearInterval(this.feedbackTimerInterval);
    if (this.scheduledAutoNext) clearTimeout(this.scheduledAutoNext);
    this.subscriptions.forEach(sub => {
      if (sub && typeof sub.unsubscribe === 'function') sub.unsubscribe();
    });
    if (this.dialog?.openDialogs?.length > 0) {
      this.dialog.openDialogs.forEach(d => d.close());
    }
  }

  ngOnInit(): void {
    this.userData = this.authService.currentUserValue;
    this.quizSlug = this.route.snapshot.paramMap.get('qcode');
    this.quizConfig = this.quizService.getQuizConfig();
    console.log('QuizPlayer Loaded QuizConfig', this.quizConfig);
    if (this.quizSlug) {
      this.loadQuiz();
    } else {
      this.authService.redirectToErrorPage();
    }
  }

  ngAfterViewInit(): void {}

  private loadQuiz(): void {
    const quizSub = this.quizService.getQuiz(this.quizSlug).subscribe(data => {
      this.quiz = data;
      this.loadingText = 'Loading Assessment Panel';
      this.questions = (data.questions || []).map((q: any) => ({
        ...q,
        options: q.options || [],
        selectedChoice: '',
        topicsArr: q.topics ? q.topics.map((t: any) => t.title) : [],
      }));
      this.currentQuestion = this.questions[this.currentQuestionId];
      this.quizDuration = this.questions.reduce((sum, q) => sum + (q.timeAllowed || 0), 0);
      console.log('QuizPlayer Questions Loaded', this.questions);
      if (this.questions.length) {
        this.startQuestionTimer(this.questions[0]);
        this.disableOptionClickTemporarily();
      }
      const loadingTimeout = setTimeout(() => { this.loading = false; }, 3000);
      this.scheduledAutoNext = loadingTimeout;
    });
    this.subscriptions.push(quizSub);
  }

  startQuestionTimer(question: QuizQuestion): void {
    if (this.questionTimerInterval) {
      clearInterval(this.questionTimerInterval);
      this.onTimerComplete();
    }
    this.questionTimeLeft = question.timeAllowed || 30;

    this.questionTimerInterval = setInterval(() => {
      this.questionTimeLeft--;

      if (this.questionTimeLeft === 10 && this.quizConfig.mode === 'Default' && !this.warningActive) {
        this.showWarningToast = true;
        this.warningActive = true;
        setTimeout(() => { this.showWarningToast = false; }, 2000);
      }

      if (this.questionTimeLeft <= 0) {
        clearInterval(this.questionTimerInterval);
        if (this.quizConfig.mode === 'Default') {
          this.onSlideNext();
        } else {
          // Interactive mode timeout — show inline feedback
          question.hasAnswered = true;
          this.onSelectionPhase = true;
          this.showFeedback(false, true, question);
        }
      }
    }, 1000);
  }

  optionSelected($event: MouseEvent, choice: number, question: QuizQuestion): void {
    if (question.hasAnswered) return;
    if (!this.allowOptionClick) {
      this.snackBar.open('Please read the question before attempting.', '', {
        duration: 1500,
        panelClass: ['snackbar-warning'],
      });
      return;
    }

    this.onSelectionPhase = true;
    question.selectedOption = choice;
    question.hasAnswered = true;

    const isCorrect = question.options.some(
      (opt: any) => opt.id === question.selectedOption && opt.correct === true
    );

    if (this.quizConfig.enableAudio) {
      // Speech alternative: speak a short verdict, not the raw options array.
      // Only safe in Interactive mode — Default mode auto-advances in 1.2-1.6s,
      // too fast for an utterance to finish before the next cancel() cuts it off.
      try {
        if (this.quizConfig.mode === 'Interactive') {
          this.speech.speak(
            isCorrect ? 'Correct!' : `Oh Incorrect. ${question.answer}`,
            { profile: isCorrect ? 'cheerful' : 'calm' }
          );
        }
      } catch (error) {
        console.log('Speech synthesis error:', error);
      }
    }

    if (this.quizConfig.mode === 'Interactive') {
      if (isCorrect) this.triggerCelebration($event);
      this.showFeedback(isCorrect, false, question);
      return;
    }

    // Default mode: auto-advance after short delay
    this.scheduledAutoNext = setTimeout(() => {
      this.onSlideNext();
      this.onSelectionPhase = false;
    }, isCorrect ? 1600 : 1200);
  }

  private showFeedback(isCorrect: boolean, isTimeout: boolean, question: QuizQuestion): void {
    if (this.feedback.show) return;
    if (this.feedbackTimerInterval) clearInterval(this.feedbackTimerInterval);

    // Correct: 3s (they already know). Wrong/timeout: 12s to read the answer.
    const secs = isCorrect ? 3 : 12;
    this.feedback = {
      show: true,
      isCorrect,
      isTimeout,
      marks: (question as any).marks || 0,
      answer: question.answer || '',
      rewardMsgIdx: Math.floor(Math.random() * 5),
      autoIn: secs,
      autoInTotal: secs,
    };

    // Scroll the feedback strip into view within the active slide so the user sees it
    setTimeout(() => this.scrollToFeedback(), 180);

    this.feedbackTimerInterval = setInterval(() => {
      this.feedback.autoIn--;
      if (this.feedback.autoIn <= 0) {
        clearInterval(this.feedbackTimerInterval);
        this.dismissFeedback();
      }
    }, 1000);
  }

  private scrollToFeedback(): void {
    // Target only the active slide's feedback div — not other slides that also render it
    const allSlides = document.querySelectorAll('.tq-slide');
    const activeSlide = allSlides[this.currentQuestionId] as HTMLElement | undefined;
    const feedbackEl = activeSlide?.querySelector('.tq-feedback') as HTMLElement | null;
    feedbackEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  dismissFeedback(): void {
    if (this.feedbackTimerInterval) clearInterval(this.feedbackTimerInterval);
    this.feedback.show = false;
    this.hintActive = false;
    this.answerActive = false;
    this.onSelectionPhase = false;
    this.onSlideNext();
  }

  onSlideNext(): void {
    this.warningActive = false;
    if (this.feedbackTimerInterval) clearInterval(this.feedbackTimerInterval);
    this.feedback.show = false;

    if (this.currentQuestionId < this.questions.length - 1) {
      this.swiperEx.nativeElement.swiper.slideNext();
      this.updateCurrentIndex();
      this.disableOptionClickTemporarily();
      this.startQuestionTimer(this.questions[this.currentQuestionId]);
      if (this.quizConfig.enableAudio) this.quizHelper.playSound('click');
    } else {
      if (this.quizConfig.enableAudio) {
        this.speech.speak("Well Done! You have completed the assessment. Submitting your results now.");
      }
      this.completeQuiz();
    }
    clearTimeout(this.scheduledAutoNext);
  }

  onSlidePrev(): void {
    this.warningActive = false;
    if (this.currentQuestionId > 0) {
      this.swiperEx.nativeElement.swiper.slidePrev();
      this.updateCurrentIndex();
      this.disableOptionClickTemporarily();
      this.startQuestionTimer(this.questions[this.currentQuestionId]);
      clearTimeout(this.scheduledAutoNext);
    }
  }

  private disableOptionClickTemporarily(): void {
    this.allowOptionClick = false;
    setTimeout(() => { this.allowOptionClick = true; }, 3000);
  }

  showHint(): void {
    if (this.currentQuestion?.hint) {
      this.currentHint = this.currentQuestion.hint;
      this.currentQuestion.hintUsed = true;
      if (this.quizConfig.enableAudio) this.quizHelper.playSound('ping');
    } else {
      this.currentHint = 'Hint not available';
    }
    this.hintActive = true;
  }

  showAnswers(): void {
    if (this.currentQuestion?.answer) {
      this.currentQuestion.answerSeen = true;
      if (this.quizConfig.enableAudio) {
        this.speech.speak(this.currentQuestion?.answer || 'Answer not available');
      }
    }
    this.answerActive = true;
  }

  hideHint(): void {
    this.hintActive = false;
    this.currentHint = '';
  }

  hideAnswer(): void {
    this.answerActive = false;
  }

  onTick(event: any): void {
    if (event.minutes === 1 && event.seconds === 0) {
      this.showWarningToast = true;
      setTimeout(() => {
        this.warningActive = true;
        this.showWarningToast = false;
      }, 3000);
    }
  }

  onTimerComplete(): void {
    this.warningActive = false;
    this.showWarningToast = false;
    if (this.quizConfig.enableAudio) this.quizHelper.playSound('click');
    console.log('Quiz Timed Out!', this.questions);
  }

  private completeQuiz(): void {
    console.log('Quiz complete!', this.questions);
    this.submitQuiz();
  }

  private updateCurrentIndex(): void {
    this.currentQuestionId = this.swiperEx.nativeElement.swiper.activeIndex;
    this.currentQuestion = this.questions[this.currentQuestionId];
  }

  submitQuiz(): void {
    console.log('QuizPlayer submitQuiz() with user', this.authService.currentUserValue);
    clearInterval(this.questionTimerInterval);
    if (!(this.authService.currentUserValue && this.authService.currentUserValue.email)) {
      if (!this.displayingAuthDialog) this.quickRegister();
      return;
    }
    this.loading = true;
    this.loadingText = 'Submitting Quiz';
    const analytics = this.quizService.processAndSaveResults(this.questions, this.quiz.id);
    const sub = this.quizService.submitQuiz(analytics).subscribe(
      (data: any) => {
        this.quizResult = data.data;
        const completeTimeout = setTimeout(() => {
          this.completed = true;
          this.navigateToResult(this.quizResult.resultCode);
        }, 3000);
        this.scheduledAutoNext = completeTimeout;
      },
      (error: any) => {
        this.showNotification('snackbar-danger', error, 'bottom', 'center');
      },
    );
    this.subscriptions.push(sub);
  }

  isCodeQuestion(text: string): boolean {
    return this.utility.isCodeQuestion(text);
  }

  quickRegister(): void {
    this.displayingAuthDialog = true;
    const dialogRef = this.dialog.open(LoginFormComponent, {
      width: 'auto',
      height: 'auto',
      maxWidth: '480px',
      data: {
        title: 'Your Attempts are saved',
        message: 'Login/ Register to submit your assessment.',
        action: 'Exit this Assessment',
      },
      disableClose: true,
    });
    const sub = dialogRef.afterClosed().subscribe((result: any) => {
      console.log('Take Quiz QuickAuth Complete', result);
      this.displayingAuthDialog = false;
      if (result?.id) {
        this.showNotification(
          'snackbar-danger',
          result?.isNewUser ? 'Quick Registration Complete.' : 'Welcome back ' + result?.firstName,
          'bottom',
          'center',
        );
        if (!this.quizResult) {
          console.log('Submitted again', this.authService.currentUserValue);
          this.submitQuiz();
        }
      }
    });
    this.subscriptions.push(sub);
  }

  showNotification(colorName: string, text: string, placementFrom: any, placementAlign: any): void {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }

  navigateToResult(resultCode: string): void {
    this.router.navigate(['quiz/result', resultCode], { replaceUrl: true });
  }

  triggerCelebration(event: MouseEvent): void {
    try {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      this.celebrationTrigger = {
        x: event.clientX,
        y: event.clientY - rect.height / 2,
      };
    } catch (error) {
      console.log('triggerCelebration error', error);
    }
  }

  onCelebrationFinished(): void {
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

  openSettingsDialog(): void {
    const dialogRef = this.dialog.open(QuizCreateComponent, {
      width: '60vw',
      height: 'auto',
      minWidth: '345px',
      data: { editMode: true, title: 'Select your preference', message: '' },
      hasBackdrop: true,
      backdropClass: 'quiz-blur-backdrop',
      autoFocus: true,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.quizConfig = this.quizService.getQuizConfig();
        console.log('QuizPlayer QuizConfig updated', this.quizConfig);
      }
    });
  }
}
