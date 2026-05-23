import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
} from '@angular/core';

import { MatButtonModule } from '@angular/material/button';

import { MatCardModule } from '@angular/material/card';

import { Router } from '@angular/router';

import { QuizService } from 'src/app/quiz/quiz.service';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService } from '@core/service/auth.service';

import { FormsModule } from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';


import { MatFormFieldModule } from '@angular/material/form-field';
import { QuizFilterSidebarComponent } from './quiz-filter-sidebar.component';
import { MatIcon } from '@angular/material/icon';
import { RightSidebarService } from '@core/service/rightsidebar.service';

@Component({
  selector: 'app-standard-quiz',

  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    FormsModule,
    MatIcon,
    MatSelectModule,
    MatFormFieldModule,
    QuizFilterSidebarComponent,
  ],
  providers: [RightSidebarService],

  templateUrl:
    './standard-quiz.component.html',

  styleUrls: [
    './standard-quiz.component.scss',
  ],
})
export class StandardQuizComponent implements OnInit {
  private rightSidebarService = inject(RightSidebarService);
  quizzes: any[] = [];
  subjects: any[] = [];
  allTopics: any[] = [];

  openSidebar() {
    this.rightSidebarService.setRightSidebar(true);
  }

  closeSidebar() {
    this.rightSidebarService.setRightSidebar(false);
  }

  // Filtered topics for selected subject
  topics: any[] = [];

  filteredTopics: any[] = [];

  selectedTopicId: number = 0;

  selectedSubjectId: number = 0;

  filterSidebarOpen = false;

  isLoading = false;

  constructor(
    private quizService: QuizService,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {

    this.loadSubjects();

    this.loadQuizzes();
  }

  loadSubjects(): void {

    this.quizService
      .getSubjectsTopics()
      .subscribe({

        next: (res: any) => {

          this.subjects =
            res?.data?.subjects || [];

          // Store all topics
          this.allTopics =
            res?.data?.topics || [];

          // Initially no filtered topics
          this.syncTopics(this.selectedSubjectId);

          console.log(
            'Subjects:',
            this.subjects,
          );

          console.log(
            'Topics:',
            this.allTopics,
          );
        },

        error: (error) => {

          console.error(
            'Failed to load subjects/topics',
            error,
          );
        },
      });
  }

  private syncTopics(
  subjectId:
    | number
    | number[]
    | null,
): void {

  // All Subjects selected
  if (
    subjectId === null ||
    subjectId === undefined ||
    subjectId === 0 ||
    (
      Array.isArray(subjectId) &&
      subjectId.length === 0
    )
  ) {

    this.filteredTopics = [
      ...this.allTopics,
    ];

    return;
  }

  const subjectIds =
    Array.isArray(subjectId)
      ? subjectId.map(
          (value) =>
            Number(value),
        )
      : [Number(subjectId)];

  this.filteredTopics =
    this.allTopics.filter(
      (topic: any) => {

        const topicSubjectId =
          topic.subjectId ??
          topic.subject?.id;

        return subjectIds.includes(
          Number(topicSubjectId),
        );
      },
    );

  // Reset topic if invalid
  const topicStillValid =
    this.filteredTopics.some(
      (topic: any) =>
        topic.id ===
        this.selectedTopicId,
    );

  if (!topicStillValid) {

    this.selectedTopicId = 0;
  }
}

  applyFilter(): void {

    this.loadQuizzes();
  }

  onSubjectChange(): void {

    this.syncTopics(this.selectedSubjectId);
  }

  resetFilters(): void {

    this.selectedSubjectId = 0;
    this.selectedTopicId = 0;

    this.syncTopics(this.selectedSubjectId);
    this.applyFilter();
  }

  loadQuizzes(): void {

    this.isLoading = true;

    this.quizService
      .getPublishedQuizzes(
        this.selectedSubjectId,
        this.selectedTopicId,
      )
      .subscribe({

        next: (res: any) => {

          console.log(
            'Filtered Quiz Response:',
            res,
          );

          this.quizzes =
            Array.isArray(res)
              ? res
              : res?.data || [];

          console.log(
            'Updated quizzes:',
            this.quizzes,
          );

          this.isLoading = false;
        },

        error: (error) => {

          console.error(
            'Failed to load quizzes',
            error,
          );

          this.isLoading = false;
        },
      });
  }

  takeQuiz(slug: string): void {

    const takeQuizUrl =
      `/quiz/take/${slug}`;
  
      this.router.navigateByUrl(
        takeQuizUrl,
      );
  }

  toggleRightSidebar(): void {
    // Toggle sidebar open/close using the service only
    this.rightSidebarService.setRightSidebar(true);
  }
}
