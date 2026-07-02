import { Direction } from '@angular/cdk/bidi';
import { CommonModule, NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService, Role } from '@core';
import { QuizQuestion } from '@core/models/quiz-question';
import { SnackbarService } from '@core/service/snackbar.service';
import { UtilsService } from '@core/service/utils.service';
import { SafePipe } from '@shared/pipes/safehtml.pipe';
import { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';
import { FullQuestion } from '../manage/question-item.model';
import { QuestionService } from '../manage/questions.service';
import { QuestionFormPage } from '../question-form/question-form.component';
interface Quiz {
  title: string;
  subject_icon: string;
  questions: QuizQuestion[];
}
@Component({
  selector: 'app-question-viewer',
  templateUrl: './question-viewer.component.html',
  styleUrls: ['./question-viewer.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    NgClass,
    SafePipe,
  ],
})
export class QuestionViewerComponent implements OnInit, AfterViewInit {
  questions: FullQuestion[] = [];
  currentQuestionId = 0;
  currentQuestion: FullQuestion;
  loading = true;
  loadingText = 'Loading Questions';
  completed = false;
  mode = 0; //1 for interactive
  whitelistStates: { [key: number]: boolean } = {};
  private readonly whitelistStorageKey = 'questionViewerWhitelistStates';

  @ViewChild('swiperEx') swiperEx!: ElementRef<{ swiper: Swiper }>;

  constructor(
    private sanitizer: DomSanitizer,
    private utility: UtilsService,
    private router: Router,
    public dialog: MatDialog,
    private snackService: SnackbarService,
    private questionService: QuestionService,
    private authService: AuthService,
  ) {
    register(); // Register Swiper web components
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  ngAfterViewInit(): void {
    // Swiper is automatically initialized via web component
  }

  get isAdmin(): boolean {
    const role = this.authService.currentUserValue?.role;
    return role === Role.Admin || role === Role.All;
  }

  canEditQuestion(question: FullQuestion): boolean {
    return this.isAdmin || !this.whitelistStates[question?.id];
  }

  private loadQuestions(): void {
    this.questionService.getAllQuestions(true).subscribe((data) => {
      //this.questions = data;
      console.log('QuestionViewer API Response', data);
      this.loadingText = 'Question View is Ready';
      this.loading = false;
      data.sort((a, b) => b.id - a.id);
      this.questions = (data || []).map((q) => ({
        ...q,
        //rawQuestion:'Here.. '+q.question,
        //rawQuestion: this.sanitizer.bypassSecurityTrustHtml(q.question)
        //rawQuestion: this.sanitizer.bypassSecurityTrustHtml(`<p>This is same question with multi-line support experiment. See below code snippet:</p><pre><code>function add(a, b) { return a + b; }</code></pre>`)
      }));

      const localWhitelist = this.getLocalWhitelistStates();
      this.whitelistStates = {};
      this.questions.forEach((q) => {
        const isWhitelistedFlag = (q as any)?.isWhitelisted;
        const hasBackendWhitelistFlag =
          isWhitelistedFlag !== undefined &&
          isWhitelistedFlag !== null &&
          isWhitelistedFlag !== '';
        const backendWhitelisted = Number(isWhitelistedFlag) === 1;
        const isWhitelisted = hasBackendWhitelistFlag
          ? backendWhitelisted
          : localWhitelist[q.id] === true;
        this.whitelistStates[q.id] = isWhitelisted;
      });
      this.persistWhitelistStates();

      this.currentQuestion = this.questions[this.currentQuestionId];
    });
  }

  /** Capture selected answer */
  optionSelected(choice: string, question: FullQuestion): void {
    if (!question.hasAnswered) {
      question.selectedChoice = Number(choice);
      question.hasAnswered = true;
    }
  }

  /** Navigate to next question */
  onSlideNext(): void {
    if (this.currentQuestionId < this.questions.length - 1) {
      this.swiperEx.nativeElement.swiper.slideNext();
      this.updateCurrentIndex();
    } else {
      this.exitViewer();
    }
  }

  /** Navigate to previous question */
  onSlidePrev(): void {
    if (this.currentQuestionId > 0) {
      this.swiperEx.nativeElement.swiper.slidePrev();
      this.updateCurrentIndex();
    }
  }

  private updateCurrentIndex(): void {
    this.currentQuestionId = this.swiperEx.nativeElement.swiper.activeIndex;
    this.currentQuestion = this.questions[this.currentQuestionId];
  }

  exitViewer() {
    this.router.navigate(['/admin/dashboard/main']);
  }

  routeEditQuestionPage(slug: string, question: FullQuestion) {
    if (!this.canEditQuestion(question)) {
      this.snackService.display(
        'snackbar-dark',
        'Whitelisted questions can only be edited by admins.',
        'bottom',
        'center',
      );
      return;
    }

    this.router.navigate(['/lms/questions/update', slug]);
  }

  editQuestion(question: FullQuestion) {
    if (!this.canEditQuestion(question)) {
      this.snackService.display(
        'snackbar-dark',
        'Whitelisted questions can only be edited by admins.',
        'bottom',
        'center',
      );
      return;
    }

    this.launchQuestionEditorModal('update', question);
  }

  launchQuestionEditorModal(action: 'add' | 'update', data?: any) {
    let varDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    } else {
      varDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(QuestionFormPage, {
      width: '100vw',
      height: '100vh',
      maxWidth: '600px',
      //panelClass: 'full-screen-dialog',
      data: { questionItem: data, action },
      direction: varDirection,
      autoFocus: false,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        //console.log("QuestionViewer close result", result);
        if (!result.error) {
          this.snackService.display(
            'snackbar-dark',
            result.message ?? 'Question updated successfully.',
            'bottom',
            'center',
          );
          //update
        } else {
          this.snackService.display(
            'snackbar-dark',
            result.message ?? 'Failed to update question.',
            'bottom',
            'center',
          );
        }
        //this.onQuestionChange(result.data);
      }
    });
  }

  getChoiceClass(choice: { id: number; option: string; correct: boolean }, question: FullQuestion): string {
    if (this.mode === 0) {
      return choice.correct ? 'qv-opt--correct' : '';
    }
    if (question.selectedChoice === choice.id) {
      return choice.correct ? 'qv-opt--correct' : 'qv-opt--wrong';
    }
    return '';
  }

  isCodeQuestion(text: string): boolean {
    return this.utility.isCodeQuestion(text);
  }

  getLevelDisplay(level: number | string | undefined): string {
    switch (Number(level)) {
      case 1:
        return 'Easy';
      case 2:
        return 'Intermediate';
      case 3:
        return 'Advanced';
      default:
        return level ? String(level) : '';
    }
  }

  whitelistQuestion(question: FullQuestion): void {
    if (!this.isAdmin) {
      this.snackService.display(
        'snackbar-dark',
        'Only admins can whitelist questions.',
        'bottom',
        'center',
      );
      return;
    }

    this.questionService.whitelistQuestion(question.id).subscribe({
      next: () => {
        this.whitelistStates[question.id] = true;
        this.persistWhitelistStates();
        this.snackService.display(
          'snackbar-dark',
          'Question WhiteListed successfully',
          'bottom',
          'center',
        );
      },
      error: () => {
        this.snackService.display(
          'snackbar-dark',
          'Failed to whitelist question',
          'bottom',
          'center',
        );
      },
    });
  }

  private getLocalWhitelistStates(): { [key: number]: boolean } {
    try {
      const saved = localStorage.getItem(this.whitelistStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  private persistWhitelistStates(): void {
    localStorage.setItem(
      this.whitelistStorageKey,
      JSON.stringify(this.whitelistStates),
    );
  }
}
