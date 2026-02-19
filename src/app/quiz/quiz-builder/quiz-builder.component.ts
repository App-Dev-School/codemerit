import { Component, OnInit, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Swiper } from 'swiper';
import { register } from 'swiper/element/bundle';
import { QuizFormPage } from '@shared/components/quiz-form/quiz-form.component';
import { QuizQuestionsFormComponent } from '@shared/components/quiz-questions-form/quiz-questions-form.component';
import { QuizSettingsFormComponent } from '@shared/components/quiz-settings-form/quiz-settings-form.component';
import { SnackbarService } from '@core/service/snackbar.service';
import { QuizService } from '../quiz.service';
import { QuizCreateModel } from '@core/models/dtos/GenerateQuizDto';
import { AuthService } from '@core';

register();

@Component({
  selector: 'app-quiz-builder',
  templateUrl: './quiz-builder.component.html',
  styleUrls: ['./quiz-builder.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    QuizFormPage,
    QuizQuestionsFormComponent,
    QuizSettingsFormComponent
  ]
})
export class QuizBuilderComponent implements OnInit {
  currentStep = 0;
  canProceedToNext = false;
  quizFormData: any = {};
  quizQuestionsData: any[] = [];
  quizSettingsData: any = {};
  //other fields
  loading = false;
  editMode: boolean = false;//reserved for future use when we add quiz editing functionality
  error: string = '';
  generatedQuizCode = '';

  constructor(private snackbar: SnackbarService, private authService: AuthService, private quizService: QuizService) { }

  ngOnInit(): void { }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.canProceedToNext = true;
    }
  }

  nextStep(): void {
    if (this.currentStep === 1 && !this.canProceedToNext) {
      this.snackbar.display('warn', 'At least 3 more questions required to continue.', 'top', 'center');
      return;
    }
    if (this.currentStep < 2) {
      this.currentStep++;
      this.canProceedToNext = false;
    }
  }

  onQuizFormSubmit(data: any): void {
    this.quizFormData = data;
    this.canProceedToNext = true;
  }

  onQuestionsAdded(questions: any[]): void {
    this.quizQuestionsData = questions;
    if (questions && questions.length >= 3) {
      this.canProceedToNext = true;
    } else {
      this.canProceedToNext = false;
      this.snackbar.display('warn', 'At least 3 more questions required to continue.', 'top', 'center');
    }
  }

  onSettingsFormSubmit(data: any): void {
    this.quizSettingsData = data;
    this.canProceedToNext = true;
  }

  get allStepsValid(): boolean {
    // Add more robust validation as needed
    return !!this.quizFormData && this.quizQuestionsData.length >= 3 && !!this.quizSettingsData;
  }

  publishQuiz(): void {
    const quizData = {
      quiz: this.quizFormData,
      questions: this.quizQuestionsData,
      settings: this.quizSettingsData
    };
    console.log('QuizBuilder Quiz Data:', quizData);
    //Prepare the payload for API
    const payload = new QuizCreateModel();
    payload.userId = this.authService.currentUserValue.id;
    payload.title = this.quizFormData.title;
    payload.shortDesc = this.quizFormData.shortDesc;
    payload.description = this.quizFormData.description;
    payload.subjectIds = this.quizFormData.subjectIds ? this.quizFormData.subjectIds.join(',') : '';
    payload.topicIds = this.quizFormData.topicIds ? this.quizFormData.topicIds.join(',') : '';
    payload.tag = this.quizFormData.tag;
    payload.questionIds = this.quizQuestionsData.map(q => q.id);
    //payload.isPublished = this.quizFormData.isPublished;
    //payload.questionsCount = this.quizQuestionsData.length;
    payload.quizType = this.quizFormData.quizType;
    payload.settings = {
      mode: this.quizSettingsData.mode,
      numQuestions: this.quizSettingsData.numQuestions,
      ordering: this.quizSettingsData.ordering,
      showHint: this.quizSettingsData.showHint,
      showAnswers: this.quizSettingsData.showAnswers,
      enableNavigation: this.quizSettingsData.enableNavigation,
      enableAudio: this.quizSettingsData.enableAudio,
      enableTimer: this.quizSettingsData.enableTimer
    }
    //payload.subjectIds = subject > 0 ? '' + subject : null;
    //payload.topicIds = topic > 0 ? '' + topic : null;
    console.log('QuizBuilder Payload:', payload);

    // Call the quizCreate API now
    this.loading = true;
    this.quizService
      .addQuiz(payload)
      .subscribe({
        next: (response) => {
          console.log('QuizBuilder CreateQuizAPI Response:', response);
          if (response && !response.error && response?.data?.slug) {
            const slug = response?.data?.slug;
            if (slug && slug !== '') {
              setTimeout(() => {
                this.generatedQuizCode = slug;
                //this.launchQuiz(this.generatedQuizCode);
                this.loading = false;
              }, 2000);
            }
          } else {
            this.loading = false;
            this.snackbar.display('snackbar-dark', response?.message ?? 'Failed to process your Quiz request. Please try again later.', 'bottom', 'center');
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Error generating Quiz. Please try again.';
          console.error('QuizBuilder CreateAPI Error:', error);
          this.snackbar.display('snackbar-dark', this.error, 'bottom', 'center');
        },
      });
  }
}
