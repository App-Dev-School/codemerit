import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuizResultTopic } from '@core/models/quiz';

import { ActivityListComponent } from '@shared/components/activity-list/activity-list.component';
import { CelebrationOverlayComponent } from '@shared/components/celebration-overlay/celebration-overlay.component';
import { DailyLessonsWidgetComponent } from '@shared/components/daily-lessons-widget/daily-lessons-widget.component';
import { FileUploadComponent } from '@shared/components/file-upload/file-upload.component';
import { MedalCardComponent } from '@shared/components/medal-card/medal-card.component';
import { QuizAttemptsComponent } from '@shared/components/quiz-attempts/quiz-attempts.component';
import { SubjectFormComponent } from '@shared/components/subject-form/subject-form.component';
import { TopicsScore } from '@shared/components/topic-wise-score/topics-score.component';

@Component({
  selector: 'app-ui-tests',
  templateUrl: './ui-tests.component.html',
  styleUrl: './ui-tests.component.scss',
  imports: [
    FormsModule,
    ActivityListComponent,
    CelebrationOverlayComponent,
    DailyLessonsWidgetComponent,
    FileUploadComponent,
    MedalCardComponent,
    QuizAttemptsComponent,
    SubjectFormComponent,
    TopicsScore,
  ],
})
export class UiTestsComponent {
  // 1. activity-list
  activities = [
    {
      userImage: 'assets/images/user/1.jpg',
      userName: 'Priya Sharma',
      label: 'PASSED',
      labelStyle: 'bg-emerald-100 text-emerald-700',
      time: '2h ago',
      message: 'Completed the Angular Fundamentals quiz with 92% score.',
      isActive: true,
    },
    {
      userImage: 'assets/images/user/2.jpg',
      userName: 'Arjun Mehta',
      label: 'RETRY',
      labelStyle: 'bg-amber-100 text-amber-700',
      time: '5h ago',
      message: 'Attempted the RxJS Advanced quiz, scored below passing.',
      isActive: false,
    },
  ];

  // 2. celebration-overlay: no inputs required beyond defaults

  // 3. daily-lessons-widget: no inputs required

  // 7. medal-card
  onMedalAction(action: string) {
    console.log('medal action clicked:', action);
  }

  // 8. quiz-attempts
  attemptQuestions = [
    {
      text: 'Which lifecycle hook runs once after Angular first displays the component?',
      isSkipped: false,
      isCorrect: 1,
      options: [
        { id: 1, text: 'ngOnInit', correct: true, selected: true },
        { id: 2, text: 'ngOnChanges', correct: false, selected: false },
        { id: 3, text: 'ngAfterViewInit', correct: false, selected: false },
      ],
    },
    {
      text: 'What does the `takeUntilDestroyed` operator do?',
      isSkipped: true,
      isCorrect: 0,
      options: [
        { id: 1, text: 'Cancels HTTP retries', correct: false, selected: false },
        { id: 2, text: 'Auto-unsubscribes on component destroy', correct: true, selected: false },
      ],
    },
  ];

  // 13. topic-wise-score
  topicScores: QuizResultTopic[] = [
    { id: 1, title: 'Component Lifecycle', coverage: '80' },
    { id: 2, title: 'RxJS Operators', coverage: '55' },
    { id: 3, title: 'State Management', coverage: '70' },
  ];

  // 5. file-upload
  uploadedFile: File | null = null;
}
