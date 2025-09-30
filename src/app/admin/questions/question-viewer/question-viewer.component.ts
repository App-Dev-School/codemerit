import { Direction } from '@angular/cdk/bidi';
import { CommonModule, NgClass } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChip } from "@angular/material/chips";
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { QuizQuestion } from '@core/models/quiz-question';
import { UtilsService } from '@core/service/utils.service';
import { SafePipe } from '@shared/pipes/safehtml.pipe';
import { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';
import { FullQuestion } from '../manage/question-item.model';
import { QuestionService } from '../manage/questions.service';
import { QuestionFormPage } from '../question-form/question-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from '@core/service/snackbar.service';
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
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    SafePipe,
    MatChip
  ]
})
export class QuestionViewerComponent implements OnInit, AfterViewInit {
  questions: FullQuestion[] = [];
  currentQuestionId = 0;
  currentQuestion : FullQuestion;
  loading = true;
  loadingText = 'Loading Questions';
  completed = false;
  mode = 0; //1 for interactive

  @ViewChild('swiperEx') swiperEx!: ElementRef<{ swiper: Swiper }>;

  constructor(private sanitizer: DomSanitizer,
    private utility: UtilsService,
    private router: Router,
    public dialog: MatDialog,
    private snackService: SnackbarService,
    private questionService: QuestionService) {
    register(); // Register Swiper web components
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  ngAfterViewInit(): void {
    // Swiper is automatically initialized via web component
  }

  private loadQuestions(): void {
    this.questionService.getAllQuestions(true)
      .subscribe(data => {
        //this.questions = data;
        console.log('QuestionViewer API Response', data);
        this.loadingText = 'Question View is Ready';
        this.loading = false;
        data.sort((a, b) => b.id - a.id);
        console.log("QuestionViewer queestions", data);
        this.questions = (data || []).map(q => ({
          ...q,
          //rawQuestion:'Here.. '+q.question,
          //rawQuestion: this.sanitizer.bypassSecurityTrustHtml(q.question)
          //rawQuestion: this.sanitizer.bypassSecurityTrustHtml(`<p>This is same question with multi-line support experiment. See below code snippet:</p><pre><code>function add(a, b) { return a + b; }</code></pre>`)
        }));
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

    routeEditQuestionPage(slug: string) {
    //const question = this.questions.find(ques => ques.id === this.currentQuestionId+1);
    this.router.navigate(['/admin/questions/update', slug]);
  }

  editQuestion(slug: string) {
    //const question = this.questions.find(ques => ques.id === this.currentQuestionId+1);
    //this.router.navigate(['/admin/questions/update', slug]);
    this.launchQuestionEditorModal('update', this.currentQuestion);
  }

  launchQuestionEditorModal(action: 'add' | 'update', data?: any) {
    let varDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    } else {
      varDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(QuestionFormPage, {
      width: '80vw',
      height: '100vh',
      minWidth: '360px',
      //panelClass: 'full-screen-dialog',
      data: { questionItem: data, action },
      direction: varDirection,
      autoFocus: false,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        //console.log("QuestionViewer close result", result);
        if(!result.error){
          this.snackService.display('snackbar-dark', result.message?? "Question updated successfully.", 'bottom', 'center');
        }else{
          this.snackService.display('snackbar-dark', result.message?? "Failed to update question.", 'bottom', 'center');
        }
        //this.onQuestionChange(result.data);
      }
    });
  }

  isCodeQuestion(text: string): boolean {
    return this.utility.isCodeQuestion(text);
  }
}