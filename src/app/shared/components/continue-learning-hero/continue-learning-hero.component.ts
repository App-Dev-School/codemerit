import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SubjectTrackTopic } from '@core/models/subject-dashboard.model';
import { CourseProgressComponent } from '@shared/components/course-progress/course-progress.component';

@Component({
  selector: 'app-continue-learning-hero',
  templateUrl: './continue-learning-hero.component.html',
  styleUrl: './continue-learning-hero.component.scss',
  imports: [CourseProgressComponent],
})
export class ContinueLearningHeroComponent {
  // jumpBackInSubjects[0] — loosely typed image/title/slug/coverage/score/attempted/numTrivia
  @Input() subject: any;
  @Input() nextTopic: SubjectTrackTopic | null = null;
  @Input() milestoneTitle: string | null = null;
  @Input() loading = false;
  @Output() resume = new EventEmitter<any>();
  @Output() takeQuiz = new EventEmitter<any>();
}
