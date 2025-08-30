import { CommonModule, NgClass } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChip } from "@angular/material/chips";
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { QuizQuestion } from '@core/models/quiz-question';
import { QuizResultComponent } from '@shared/components/quiz-result/quiz-result.component';
import { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';
import { QuestionItemDetail } from '../manage/question-item.model';
import { QuestionService } from '../manage/questions.service';
import { DomSanitizer } from '@angular/platform-browser';
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
    QuizResultComponent,
    MatChip
  ]
})
export class QuestionViewerComponent implements OnInit, AfterViewInit {
  questions: QuestionItemDetail[] = [];
  currentQuestionId = 0;
  loading = true;
  loadingText = 'Loading Questions';
  completed = false;
  evaluated = false;
  quizResult: any;
  mode = 0; //1 for interactive

  @ViewChild('swiperEx') swiperEx!: ElementRef<{ swiper: Swiper }>;

  constructor(private sanitizer: DomSanitizer, private router: Router, private questionService: QuestionService) {
    register(); // Register Swiper web components
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  ngAfterViewInit(): void {
    // Swiper is automatically initialized via web component
  }

  private loadQuestions(): void {
    const payload = {
      action: "latest",
      subjectIds: [1, 2, 3, 4, 5, 6, 7, 8, 9]
    }
    this.questionService.fetchMyQuestions(payload)
      .subscribe(data => {
        this.questions = data;
        console.log('QuestionViewer API Response', data);
        this.loadingText = 'Question View is Ready';
        this.loading = false;

        //test the completed state
        // this.completed = true;
        // this.evaluated = true;
        // Ensure each question has a selectedChoice field
        this.questions = (data || []).map(q => ({
          ...q,
          rawQuestion: this.sanitizer.bypassSecurityTrustHtml(`<p>This is same question with multi-line support experiment. See below code snippet:</p><pre><code>function add(a, b) { return a + b; }</code></pre>`)
        }));
      });
  }

  /** Record selected answer */
  optionSelected(choice: string, question: QuestionItemDetail): void {
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
      this.completeViewing();
    }
  }

  /** Navigate to previous question */
  onSlidePrev(): void {
    if (this.currentQuestionId > 0) {
      this.swiperEx.nativeElement.swiper.slidePrev();
      this.updateCurrentIndex();
    }
  }

  private completeViewing(): void {
    console.log('completeViewing', this.questions);
    this.submitQuiz();
  }

  private updateCurrentIndex(): void {
    this.currentQuestionId = this.swiperEx.nativeElement.swiper.activeIndex;
  }

  submitQuiz() {
    this.completed = true;
    setTimeout(() => {
      //this.quizResult =  this.questionService.processAndSaveResults(this.questions, 'quiz-angular-101', 'user-123');
      this.evaluated = true;
      console.log("submitQuiz", this.questions);

    }, 2000);
  }

  exitViewer(){
    this.router.navigate(['/admin/dashboard/main']);
  }

  editQuestion(){
    const question = this.questions.find(ques => ques.id === this.currentQuestionId);
    this.router.navigate(['/admin/questions/update', question.slug]);
  }
}