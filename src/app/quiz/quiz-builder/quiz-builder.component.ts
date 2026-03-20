import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '@core';
import { QuizCreateModel } from '@core/models/dtos/GenerateQuizDto';
import { SnackbarService } from '@core/service/snackbar.service';
import { QuizFormComponent } from '@shared/components/quiz-form/quiz-form.component';
import { QuizQuestionsFormComponent } from '@shared/components/quiz-questions-form/quiz-questions-form.component';
import { QuizSettingsFormComponent } from '@shared/components/quiz-settings-form/quiz-settings-form.component';
import { register } from 'swiper/element/bundle';
import { QuizService } from '../quiz.service';
import { MasterService } from '@core/service/master.service';

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
    QuizFormComponent,
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
  subjects: any[] = [];
  topics: any[] = [];
  allQuestions: any[] = [];
  //other fields
  loading = false;
  editMode: boolean = false;//reserved for future use when we add quiz editing functionality
  error: string = '';
  generatedQuizCode = '';

  constructor(
    private snackbar: SnackbarService,
    private authService: AuthService,
    private quizService: QuizService,
    private masterService: MasterService
  ) { }

  ngOnInit(): void {
    // Fetch master data (subjects, topics, questions)
    this.subjects = this.masterService.subjects;
    this.topics = this.masterService.topics;
    // If you have a questions API, fetch here. For now, use topics/subjects to filter questions if needed.
    // If questions are part of masterService, assign here. Otherwise, fetch from API/service.
    // Example: this.allQuestions = this.masterService.questions;
    this.dummyInitialize()
  }

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
    // payload.subjectIds = this.quizFormData.subjectIds ? this.quizFormData.subjectIds.join(',') : '';
    // payload.topicIds = this.quizFormData.topicIds ? this.quizFormData.topicIds.join(',') : '';
    payload.subjectIds = this.quizFormData.subjectIds;
    payload.topicIds = this.quizFormData.topicIds;
    payload.tag = this.quizFormData.tag;
    payload.questionIds = this.quizQuestionsData.map(q => q.id);
    payload.isPublished = this.quizFormData.isPublished;
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
    console.log('QuizBuilder Payload:', payload);

    // Call the quizCreate API now
    this.loading = true;
    this.quizService
      .addStandardQuiz(payload)
      .subscribe({
        next: (response) => {
          console.log('QuizBuilder CreateQuizAPI Response:', response);

          if (response && !response.error && response?.data) {
            /*
           const slug = response?.data?.slug;
            if (slug && slug !== '') {
              setTimeout(() => {
                this.generatedQuizCode = slug;
                //this.launchQuiz(this.generatedQuizCode);
                this.loading = false;
              }, 2000);
            }
           */  
          this.loading = false;
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

  dummyInitialize() {
    this.subjects = [
    { id: 1, name: 'HTML' },
    { id: 2, name: 'CSS' },
    { id: 3, name: 'JavaScript' },
    { id: 4, name: 'Node.js' },
    { id: 5, name: 'Python' },
    { id: 6, name: 'Angular' },
    { id: 7, name: 'React' }
  ];
  this.topics = [
    { id: 1, name: 'Elements', subjectId: 1 },
    { id: 2, name: 'Selectors', subjectId: 2 },
    { id: 3, name: 'Flexbox', subjectId: 2 },
    { id: 4, name: 'ES6', subjectId: 3 },
    { id: 5, name: 'Async', subjectId: 3 },
    { id: 6, name: 'Modules', subjectId: 4 },
    { id: 7, name: 'Express', subjectId: 4 },
    { id: 8, name: 'Functions', subjectId: 5 },
    { id: 9, name: 'OOP', subjectId: 5 },
    { id: 10, name: 'Components', subjectId: 6 },
    { id: 11, name: 'Services', subjectId: 6 },
    { id: 12, name: 'Hooks', subjectId: 7 },
    { id: 13, name: 'State', subjectId: 7 }
  ];
  this.allQuestions = [
    { id: 1, title: 'What does <div> represent in HTML?', subject: 'HTML', topic: 'Elements', subjectId: 1, topicId: 1, level: 'Easy' },
    { id: 2, title: 'How do you select an element by class in CSS?', subject: 'CSS', topic: 'Selectors', subjectId: 2, topicId: 2, level: 'Easy' },
    { id: 3, title: 'What is Flexbox used for?', subject: 'CSS', topic: 'Flexbox', subjectId: 2, topicId: 3, level: 'Intermediate' },
    { id: 4, title: 'What is a let declaration in ES6?', subject: 'JavaScript', topic: 'ES6', subjectId: 3, topicId: 4, level: 'Easy' },
    { id: 5, title: 'Explain Promises in JavaScript.', subject: 'JavaScript', topic: 'Async', subjectId: 3, topicId: 5, level: 'Intermediate' },
    { id: 6, title: 'How do you export a module in Node.js?', subject: 'Node.js', topic: 'Modules', subjectId: 4, topicId: 6, level: 'Easy' },
    { id: 7, title: 'What is Express used for?', subject: 'Node.js', topic: 'Express', subjectId: 4, topicId: 7, level: 'Easy' },
    { id: 8, title: 'How do you define a function in Python?', subject: 'Python', topic: 'Functions', subjectId: 5, topicId: 8, level: 'Easy' },
    { id: 9, title: 'What is a class in Python?', subject: 'Python', topic: 'OOP', subjectId: 5, topicId: 9, level: 'Intermediate' },
    { id: 10, title: 'What is a component in Angular?', subject: 'Angular', topic: 'Components', subjectId: 6, topicId: 10, level: 'Easy' },
    { id: 11, title: 'What is a service in Angular?', subject: 'Angular', topic: 'Services', subjectId: 6, topicId: 11, level: 'Intermediate' },
    { id: 12, title: 'What are React Hooks?', subject: 'React', topic: 'Hooks', subjectId: 7, topicId: 12, level: 'Intermediate' },
    { id: 13, title: 'How do you manage state in React?', subject: 'React', topic: 'State', subjectId: 7, topicId: 13, level: 'Intermediate' },
    { id: 14, title: 'What is the purpose of <span> in HTML?', subject: 'HTML', topic: 'Elements', subjectId: 1, topicId: 1, level: 'Easy' },
    { id: 15, title: 'How do you center a div using Flexbox?', subject: 'CSS', topic: 'Flexbox', subjectId: 2, topicId: 3, level: 'Intermediate' },
    { id: 16, title: 'What is the difference between var, let, and const?', subject: 'JavaScript', topic: 'ES6', subjectId: 3, topicId: 4, level: 'Intermediate' },
    { id: 17, title: 'How do you handle async code in Node.js?', subject: 'Node.js', topic: 'Modules', subjectId: 4, topicId: 6, level: 'Intermediate' },
    { id: 18, title: 'What is inheritance in Python OOP?', subject: 'Python', topic: 'OOP', subjectId: 5, topicId: 9, level: 'Advanced' },
    { id: 19, title: 'How do you create a new Angular service?', subject: 'Angular', topic: 'Services', subjectId: 6, topicId: 11, level: 'Intermediate' },
    { id: 20, title: 'What is useEffect in React?', subject: 'React', topic: 'Hooks', subjectId: 7, topicId: 12, level: 'Intermediate' }
  ];
}

}
