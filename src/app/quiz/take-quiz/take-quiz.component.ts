import { CommonModule, NgClass } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
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
export class TakeQuizComponent implements OnInit {
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

  // Floating "+N" that rises off the tapped option on a correct answer.
  pointPops: { id: number; x: number; y: number; text: string }[] = [];
  private pointPopSeq = 0;
  private pointPopTimers: any[] = [];

  // Consecutive-correct streak — drives the combo chip and escalates the
  // confetti theme (see celebrationTheme). Resets on any wrong answer/timeout.
  comboCount = 0;

  // One entry per resolved question (correct/wrong/timeout), oldest first —
  // backs the mid-quiz session summary strip (every SESSION_SUMMARY_INTERVAL
  // questions) without needing separate running counters that could drift.
  private answerLog: boolean[] = [];
  private readonly SESSION_SUMMARY_INTERVAL = 5;
  private sessionSummaryTimer: any;
  sessionSummary: { show: boolean; correct: number; total: number; percent: number; recent: boolean[]; streak: number } = {
    show: false,
    correct: 0,
    total: 0,
    percent: 0,
    recent: [],
    streak: 0,
  };

  @ViewChild('swiperEx') swiperEx!: ElementRef<{ swiper: Swiper }>;
  @ViewChild('celebs') celebrationOverlay?: CelebrationOverlayComponent;
  displayingAuthDialog = false;
  quizConfig: QuizConfig;

  questionTimeLeft = 0;
  questionTimerInterval: any;
  feedbackTimerInterval: any;
  allowOptionClick = false;
  private optionClickTimer: any;
  private readonly MAX_FEEDBACK_SECS = 30;

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
    if (this.optionClickTimer) clearTimeout(this.optionClickTimer);
    this.speech.stop();
    this.celebrationWaveTimers.forEach(t => clearTimeout(t));
    this.celebrationWaveTimers = [];
    this.pointPopTimers.forEach(t => clearTimeout(t));
    this.pointPopTimers = [];
    if (this.sessionSummaryTimer) clearTimeout(this.sessionSummaryTimer);
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
    if (this.quizSlug) {
      this.loadQuiz();
    } else {
      this.authService.redirectToErrorPage();
    }
  }

  private loadQuiz(): void {
    this.comboCount = 0;
    this.answerLog = [];
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
        // Guard against onSlidePrev/onSlideNext restarting this timer on an
        // already-answered question (e.g. user navigates back then away
        // again without interacting) — don't clobber the real timeTaken
        // recorded when it was first answered.
        if (question.timeTaken == null) {
          question.timeTaken = this.computeTimeTaken(question);
        }
        if (this.quizConfig.mode === 'Default') {
          this.onSlideNext();
        } else {
          // Interactive mode timeout — show inline feedback
          question.hasAnswered = true;
          this.onSelectionPhase = true;
          this.showFeedback(false, true, question);
          if (this.quizConfig.enableAudio) {
            try {
              this.speech.speak(this.buildWrongSpeechText("Time's up.", question), { profile: 'calm' });
            } catch (error) {
              console.log('Speech synthesis error:', error);
            }
          }
        }
      }
    }, 1000);
  }

  // Elapsed seconds on `question`, derived from the same per-second
  // countdown the timer UI already runs on (questionTimeLeft), clamped to
  // the question's own time budget rather than introducing a separate
  // wall-clock measurement that could drift from what the user sees ticking.
  private computeTimeTaken(question: QuizQuestion): number {
    const allowed = question.timeAllowed || 30;
    return Math.max(0, Math.min(allowed, allowed - this.questionTimeLeft));
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
    question.timeTaken = this.computeTimeTaken(question);

    // The question is locked in — stop this question's countdown right here.
    // Left running, it keeps ticking behind the feedback panel and can hit 0
    // while the user is still reading it, firing the timeout branch below
    // (registerAnswerOutcome(false)) and silently wiping the combo streak
    // even though the answer was correct. The feedback panel has its own
    // independent auto-advance countdown (feedbackTimerInterval), so nothing
    // needs this timer to resume — it's done for good once answered.
    // (Not nulling the field: startQuestionTimer()'s guard relies on it
    // still being truthy to play the between-question click cue.)
    if (this.questionTimerInterval) clearInterval(this.questionTimerInterval);

    const isCorrect = question.options.some(
      (opt: any) => opt.id === question.selectedOption && opt.correct === true
    );

    if (this.quizConfig.enableAudio) {
      // Speech alternative: speak a short verdict, not the raw options array.
      // Only safe in Interactive mode — Default mode auto-advances in 1.2-1.6s,
      // too fast for an utterance to finish before the next cancel() cuts it off.
      // Answer text is only spoken when showAnswers is on, mirroring the
      // visual feedback panel — audio shouldn't leak an answer the UI hides.
      try {
        if (this.quizConfig.mode === 'Interactive') {
          this.speech.speak(
            isCorrect ? 'Correct!' : this.buildWrongSpeechText('Oh Incorrect.', question),
            { profile: isCorrect ? 'cheerful' : 'calm' }
          );
        }
      } catch (error) {
        console.log('Speech synthesis error:', error);
      }
    }

    this.registerAnswerOutcome(isCorrect);
    // Particle burst is a deliberate "you got it right, pause and enjoy it"
    // moment — only makes sense in Interactive mode, which pauses for
    // feedback anyway. Default mode auto-advances in ~1.2-1.6s, too fast to
    // register a burst as anything but visual noise.
    if (isCorrect && this.quizConfig.mode === 'Interactive') {
      this.triggerCelebration($event, (question as any).marks);
      // Streak of 3+ correct in a row earns a clap layered under the confetti —
      // a single correct answer already gets speech + burst, so the clap is
      // reserved for "you're on a roll", matching the same threshold where
      // celebrationTheme escalates to 'cyber_sparks'.
      if (this.comboCount >= 3 && this.quizConfig.enableAudio) {
        this.quizHelper.playSound('clap');
      }
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

  // Answer text is only appended when Display Answer is on — audio shouldn't
  // leak an answer the feedback panel itself is hiding.
  private buildWrongSpeechText(prefix: string, question: QuizQuestion): string {
    return (this.quizConfig.showAnswers && question.answer)
      ? `${prefix} ${question.answer}`
      : prefix;
  }

  private showFeedback(isCorrect: boolean, isTimeout: boolean, question: QuizQuestion): void {
    if (this.feedback.show) return;
    if (this.feedbackTimerInterval) clearInterval(this.feedbackTimerInterval);

    // Correct: 3s (they already know). Wrong/timeout: 12s baseline reading time,
    // stretched to cover the spoken answer when audio + Display Answer are both
    // on — otherwise the progress bar (and the auto-advance it drives) cuts the
    // utterance off mid-sentence. Capped so an unusually long answer can't
    // stall the quiz indefinitely.
    let secs = isCorrect ? 3 : 12;
    if (!isCorrect && this.quizConfig.enableAudio && this.quizConfig.showAnswers && question.answer) {
      const prefix = isTimeout ? "Time's up." : 'Oh Incorrect.';
      const spokenText = this.buildWrongSpeechText(prefix, question);
      const estimatedSecs = this.speech.estimateSeconds(spokenText, 0.9) + 1; // 'calm' profile rate + trailing buffer
      secs = Math.min(this.MAX_FEEDBACK_SECS, Math.max(secs, Math.ceil(estimatedSecs)));
    }
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
    // Cut off any utterance still reading out the previous question's
    // verdict/answer — otherwise a long "Oh Incorrect, the answer is ..."
    // keeps talking over the next question once the feedback panel's
    // auto-advance timer moves the slide on before speech finishes.
    this.speech.stop();

    if (this.currentQuestionId < this.questions.length - 1) {
      this.swiperEx.nativeElement.swiper.slideNext();
      this.updateCurrentIndex();
      this.disableOptionClickTemporarily();
      this.startQuestionTimer(this.questions[this.currentQuestionId]);
      if (this.quizConfig.enableAudio) this.quizHelper.playSound('click');
    } else {
      if (this.quizConfig.enableAudio) {
        this.speech.speak("Thank you for taking this assessment.");
      }
      this.completeQuiz();
    }
    clearTimeout(this.scheduledAutoNext);
  }

  onSlidePrev(): void {
    this.warningActive = false;
    this.speech.stop();
    if (this.currentQuestionId > 0) {
      this.swiperEx.nativeElement.swiper.slidePrev();
      this.updateCurrentIndex();
      this.disableOptionClickTemporarily();
      this.startQuestionTimer(this.questions[this.currentQuestionId]);
      clearTimeout(this.scheduledAutoNext);
    }
  }

  private disableOptionClickTemporarily(): void {
    // Cancel any still-pending unlock from a previous question — without this,
    // rapid prev/next navigation could let an earlier timer fire after we've
    // already moved on, prematurely lifting the read-first lockout on the
    // question the user actually landed on.
    if (this.optionClickTimer) clearTimeout(this.optionClickTimer);
    this.allowOptionClick = false;
    this.optionClickTimer = setTimeout(() => { this.allowOptionClick = true; }, 3000);
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

  onTimerComplete(): void {
    this.warningActive = false;
    this.showWarningToast = false;
    if (this.quizConfig.enableAudio) this.quizHelper.playSound('click');
  }

  private completeQuiz(): void {
    this.submitQuiz();
  }

  private updateCurrentIndex(): void {
    this.currentQuestionId = this.swiperEx.nativeElement.swiper.activeIndex;
    this.currentQuestion = this.questions[this.currentQuestionId];
  }

  submitQuiz(): void {
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
      this.displayingAuthDialog = false;
      if (result?.id) {
        this.showNotification(
          'snackbar-danger',
          result?.isNewUser ? 'Quick Registration Complete.' : 'Welcome back ' + result?.firstName,
          'bottom',
          'center',
        );
        if (!this.quizResult) {
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
      const m = marks+5 || 1;

      this.celebrationWaveTimers.forEach(t => clearTimeout(t));
      this.celebrationWaveTimers = [];

      const waveCount = Math.min(8, Math.ceil(m / 1.5));      // 1 mark -> 1 wave, 10 marks -> 7-8 waves
      const waveIntensity = Math.min(90, 30 + m * 6);         // particles per wave
      const waveGapMs = 380;

      for (let i = 0; i < waveCount; i++) {
        const timer = setTimeout(() => {
          this.celebrationOverlay?.triggerBurst(x, y, waveIntensity);
        }, i * waveGapMs);
        this.celebrationWaveTimers.push(timer);
      }

      // Same origin as the burst — a direct "+N" cue rising off the tapped
      // option itself, distinct from the marks total that only shows up
      // inside the feedback panel a beat later.
      this.spawnPointPop(x, y, m);
    } catch (error) {
      console.log('triggerCelebration error', error);
    }
  }

  private spawnPointPop(x: number, y: number, marks: number): void {
    const id = ++this.pointPopSeq;
    this.pointPops = [...this.pointPops, { id, x, y, text: String(marks) }];
    const timer = setTimeout(() => {
      this.pointPops = this.pointPops.filter(p => p.id !== id);
    }, 1100);
    this.pointPopTimers.push(timer);
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
    this.answerLog.push(isCorrect);
    this.maybeShowSessionSummary();
  }

  // Non-blocking "how am I doing" toast every SESSION_SUMMARY_INTERVAL
  // questions — purely informational, doesn't touch the timer or advance
  // flow, and auto-dismisses on its own. Skipped on the quiz's final
  // question since the results page already gives a full wrap-up there.
  private maybeShowSessionSummary(): void {
    const answered = this.answerLog.length;
    if (answered === 0 || answered % this.SESSION_SUMMARY_INTERVAL !== 0) return;
    if (answered >= this.questions.length) return;

    const correct = this.answerLog.filter(Boolean).length;
    if (this.sessionSummaryTimer) clearTimeout(this.sessionSummaryTimer);
    this.sessionSummary = {
      show: true,
      correct,
      total: answered,
      percent: Math.round((correct / answered) * 100),
      recent: this.answerLog.slice(-this.SESSION_SUMMARY_INTERVAL),
      streak: this.comboCount,
    };
    this.sessionSummaryTimer = setTimeout(() => {
      this.sessionSummary.show = false;
    }, 3500);
  }

  dismissSessionSummary(): void {
    if (this.sessionSummaryTimer) clearTimeout(this.sessionSummaryTimer);
    this.sessionSummary.show = false;
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
      // Named for what they mean, not a color, and deliberately not
      // "bg-brown" — that collided with a global .bg-brown utility
      // (src/assets/scss/ui/_card.scss) which set black text, unreadable
      // against a brown pill.
      case 1: return 'level-easy';
      case 2: return 'level-medium';
      case 3: return 'level-hard';
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
      }
    });
  }
}
