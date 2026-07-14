import { CommonModule, NgClass } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizEntity, SubmitQuizResponse } from '@core/models/dtos/GenerateQuizDto';
import { QuizQuestion } from '@core/models/quiz-question';
import { NewlyEarned } from '@core/models/gamification.model';
import { User } from '@core/models/user';
import { AuthService } from '@core/service/auth.service';
import { UtilsService } from '@core/service/utils.service';
import { CelebrationOverlayComponent } from '@shared/components/celebration-overlay/celebration-overlay.component';
import { LoginFormComponent } from '@shared/components/login-form/login-form.component';
import { QuizCreateComponent } from '@shared/components/quiz-create/quiz-create.component';
import { popPulseAnimation } from '@shared/animations';
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
  animations: [popPulseAnimation],
  imports: [
    CommonModule,
    NgClass,
    NgScrollbar,
    CelebrationOverlayComponent,
  ],
})
export class TakeQuizComponent implements OnInit, AfterViewInit {
  private subscriptions: any[] = [];
  private destroyed = false;

  quiz!: QuizEntity;
  questions: QuizQuestion[] = [];
  currentQuestionId = 0;
  loading = true;
  loadingText = 'Loading Assessment Panel';
  quizSlug = '';
  completed = false;
  quizResult: any;
  quizDuration = 300;

  // Shown once loading finishes and before any question timer starts —
  // user must read + accept before we touch the swiper/timer.
  showAgreement = false;
  agreementAccepted = false;

  // Shown after agreement is accepted, before the first question timer
  // starts — a 3-2-1-Go beat so the first question doesn't just snap in.
  showCountdown = false;
  countdownValue = 3;

  warningActive = false;
  hintActive = false;
  answerActive = false;
  currentQuestion: QuizQuestion;
  currentHint = '';
  onSelectionPhase = false;
  showWarningToast = false;
  userData: User;
  scheduledAutoNext: any;
  private celebrationWaveTimers: any[] = [];

  // Consecutive-correct streak — drives the combo chip and escalates the
  // confetti theme (see celebrationTheme). Resets on any wrong answer/timeout.
  comboCount = 0;
  showSpeedBonus = false;
  speedBonusLabel = '';

  @ViewChild('swiperEx') swiperEx!: ElementRef<{ swiper: Swiper }>;
  @ViewChild('celebs') celebrationOverlay?: CelebrationOverlayComponent;
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
    this.celebrationWaveTimers.forEach(t => clearTimeout(t));
    this.celebrationWaveTimers = [];
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
    this.comboCount = 0;
    const quizSub = this.quizService.getQuiz(this.quizSlug).subscribe(data => {
      this.quiz = data;
      this.questions = (data.questions || []).map((q: any) => ({
        ...q,
        options: q.options || [],
        selectedChoice: '',
        topicsArr: q.topics ? q.topics.map((t: any) => t.title) : [],
      }));
      this.currentQuestion = this.questions[this.currentQuestionId];
      this.quizDuration = this.questions.reduce((sum, q) => sum + (q.timeAllowed || 0), 0);
      console.log('QuizPlayer Questions Loaded', this.questions);
      // Question timer/swiper don't start here anymore — they wait for acceptAgreement(),
      // so the countdown can't burn down while the user is still reading the terms.
      const loadingTimeout = setTimeout(() => {
        this.loading = false;
        this.showAgreement = this.questions.length > 0;
      }, 3000);
      this.scheduledAutoNext = loadingTimeout;
    });
    this.subscriptions.push(quizSub);
  }

  toggleAgreementCheck(): void {
    this.agreementAccepted = !this.agreementAccepted;
  }

  acceptAgreement(): void {
    if (!this.agreementAccepted || !this.questions.length) return;
    this.showAgreement = false;
    this.runCountdown();
  }

  private runCountdown(): void {
    this.showCountdown = true;
    this.countdownValue = 3;
    if (this.quizConfig.enableAudio) this.quizHelper.playSound('click');
    const tick = () => {
      if (this.quizConfig.enableAudio) this.quizHelper.playSound('click');
      this.countdownValue--;
      if (this.countdownValue > 0) {
        this.scheduledAutoNext = setTimeout(tick, 800);
        return;
      }
      // Brief "Go!" beat (countdownValue === 0) before the first question reveals.
      this.scheduledAutoNext = setTimeout(() => {
        this.showCountdown = false;
        this.startQuestionTimer(this.questions[0]);
        this.disableOptionClickTemporarily();
      }, 700);
    };
    this.scheduledAutoNext = setTimeout(tick, 800);
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
        this.registerAnswerOutcome(false);
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

    this.registerAnswerOutcome(isCorrect);
    if (isCorrect) {
      this.triggerCelebration($event, (question as any).marks);
      this.showSpeedAppreciation(question);
    }

    if (this.quizConfig.mode === 'Interactive') {
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
      (response: SubmitQuizResponse) => {
        this.quizResult = response.data;
        const newlyEarned = response.data.newlyEarned ?? null;
        const completeTimeout = setTimeout(() => {
          this.completed = true;
          this.navigateToResult(this.quizResult.resultCode, newlyEarned);
        }, 3000);
        this.scheduledAutoNext = completeTimeout;
      },
      (error: any) => {
        this.loading = false;
        if (error?.status === 403) {
          const message = error?.error?.message || "You've used all your attempts for this quiz.";
          this.showNotification('snackbar-danger', message, 'bottom', 'center');
        } else {
          const message = error?.error?.message || error?.message || 'Something went wrong submitting your quiz. Please try again.';
          this.showNotification('snackbar-danger', message, 'bottom', 'center');
        }
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

  navigateToResult(resultCode: string, newlyEarned: NewlyEarned | null = null): void {
    this.router.navigate(['quiz/result', resultCode], {
      replaceUrl: true,
      state: { newlyEarned },
    });
  }

  // Every correct answer gets a burst. Higher-mark questions don't just get
  // denser particles, they get a longer celebration — a handful of waves
  // staggered over time, not one bigger instant blast, so a high-value
  // question actually *feels* longer, not just busier.
  triggerCelebration(event: MouseEvent, marks: number): void {
    try {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY - rect.height / 2;
      const m = marks || 1;

      this.celebrationWaveTimers.forEach(t => clearTimeout(t));
      this.celebrationWaveTimers = [];

      const waveCount = Math.min(5, Math.ceil(m / 2));       // 1 mark -> 1 wave, 10 marks -> 5 waves
      const waveIntensity = Math.min(60, 20 + m * 4);         // particles per wave
      const waveGapMs = 350;

      for (let i = 0; i < waveCount; i++) {
        const timer = setTimeout(() => {
          this.celebrationOverlay?.triggerBurst(x, y, waveIntensity);
        }, i * waveGapMs);
        this.celebrationWaveTimers.push(timer);
      }
    } catch (error) {
      console.log('triggerCelebration error', error);
    }
  }

  // "How big" a burst is comes from question marks (triggerCelebration above).
  // "What flavor" it is comes from the current streak — the confetti escalates
  // in style, not just size, as the user gets hot.
  get celebrationTheme(): 'golden_star' | 'cyber_sparks' | 'classic_confetti' {
    if (this.comboCount >= 5) return 'classic_confetti';
    if (this.comboCount >= 3) return 'cyber_sparks';
    return 'golden_star';
  }

  private registerAnswerOutcome(isCorrect: boolean): void {
    this.comboCount = isCorrect ? this.comboCount + 1 : 0;
  }

  // A quick, distinct appreciation toast for answering well under the time
  // limit — separate from the marks-based confetti burst, so speed itself
  // feels rewarded, not just correctness.
  private showSpeedAppreciation(question: QuizQuestion): void {
    const allowed = question.timeAllowed || 0;
    if (!allowed) return;
    const remainingRatio = this.questionTimeLeft / allowed;

    let label = '';
    if (remainingRatio >= 0.7) label = '⚡ Lightning Fast!';
    else if (remainingRatio >= 0.4) label = '🚀 Quick!';
    if (!label) return;

    this.speedBonusLabel = label;
    this.showSpeedBonus = true;
    setTimeout(() => { this.showSpeedBonus = false; }, 1400);
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
