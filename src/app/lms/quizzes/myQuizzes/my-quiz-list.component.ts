import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { QuizService } from 'src/app/quiz/quiz.service';

interface QuizListItem {
  title: string;
  description: string | null;
  numQuestions: number;
  label: string | null;
  status: string;
  isPublished: boolean;
}

@Component({
  selector: 'app-my-quiz-list',
  templateUrl: './my-quiz-list.component.html',
  styleUrls: ['./my-quiz-list.component.scss'],
  imports: [CommonModule, MatCardModule, MatTableModule],
})
export class MyQuizListComponent implements OnInit {
  displayedColumns: string[] = [
    'title',
    'description',
    'numQuestions',
    'label',
    'status',
  ];
  quizzes: QuizListItem[] = [];
  loading = true;
  errorMessage = '';

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadMyQuizzes();
  }

  private loadMyQuizzes(): void {
    this.loading = true;
    this.errorMessage = '';

    this.quizService.getMyQuizzes().subscribe({
      next: (data) => {
        this.quizzes = (data ?? []).map((quiz: any) => ({
          title: quiz?.title ?? '-',
          description: quiz?.shortDesc ?? quiz?.description ?? '-',
          numQuestions: Number(quiz?.totalQuestions) || 0,
          label: quiz?.label ?? '-',
          status: quiz?.status ?? (quiz?.isPublished ? 'Published' : 'Draft'),
          isPublished: !!quiz?.isPublished,
        }));
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load your quizzes. Please try again.';
        this.loading = false;
      },
    });
  }
}
