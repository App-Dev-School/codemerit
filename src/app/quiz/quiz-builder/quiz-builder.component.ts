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
  @ViewChild('swiperContainer') swiperContainer!: ElementRef<{ swiper: Swiper }>;

  selectedTabIndex = 0;
  swiperInstance: Swiper | null = null;
  canProceedToNext = false;

  tabs = [
    { label: 'Quiz Info', icon: 'assignment' },
    { label: 'Quiz Questions', icon: 'quiz' },
    { label: 'Customize Quiz', icon: 'settings' }
  ];

  // Store form data
  quizFormData: any = {};
  quizQuestionsData: any[] = [];
  quizSettingsData: any = {};

  constructor(private snackbar: SnackbarService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.swiperContainer?.nativeElement) {
      const swiperEl = this.swiperContainer.nativeElement as any;
      this.swiperInstance = swiperEl.swiper;
    }
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    if (this.swiperInstance) {
      this.swiperInstance.slideTo(index, 300);
    }
  }

  onSwiperSlideChange(): void {
    if (this.swiperInstance) {
      this.selectedTabIndex = this.swiperInstance.activeIndex;
    }
  }


  onQuizFormSubmit(data: any): void {
    this.quizFormData = data;
    console.log('StandardQuiz Form Data 1:', data);
    this.canProceedToNext = false; // Reset for next step
    // Ensure swiperInstance is ready before moving
    setTimeout(() => {
      this.onTabChange(1);
    }, 0);
  }

  onQuestionsAdded(questions: any[]): void {
    this.quizQuestionsData = questions;
    console.log('StandardQuiz Questions Data:', questions);
    if (questions && questions.length >= 3) {
      this.canProceedToNext = true;
    } else {
      this.canProceedToNext = false;
      this.snackbar.display('warn', 'At least 3 more questions required to continue.', 'top', 'center');
    }
  }

  onQuestionsFormSubmit(data: any): void {
    this.quizQuestionsData = data;
    console.log('StandardQuiz Data 2:', data);
    // Move to next tab
    this.onTabChange(2);
  }

  onSettingsFormSubmit(data: any): void {
    this.quizSettingsData = data;
    // Handle final submission
    this.handleFinalSubmit();
  }

  handleFinalSubmit(): void {
    console.log('Quiz Builder Data:', {
      quiz: this.quizFormData,
      questions: this.quizQuestionsData,
      settings: this.quizSettingsData
    });
    // TODO: Implement actual submission logic
  }

  goToPreviousTab(): void {
    if (this.selectedTabIndex > 0) {
      this.onTabChange(this.selectedTabIndex - 1);
    }
  }

  goToNextTab(): void {
    // Only allow next if canProceedToNext is true on questions step
    if (this.selectedTabIndex === 1 && !this.canProceedToNext) {
      this.snackbar.display('warn', 'At least 3 more questions required to continue.', 'top', 'center');
      return;
    }
    if (this.selectedTabIndex < this.tabs.length - 1) {
      this.onTabChange(this.selectedTabIndex + 1);
    }
  }
}
