import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { QuizService } from 'src/app/quiz/quiz.service';

interface QuizListItem {
  title: string;
  description: string | null;
  numQuestions: number;
  label: string | null;
  status: string;
  isPublished: boolean;
  slug: string;
}

@Component({
  selector: 'app-my-quiz-list',
  templateUrl: './my-quiz-list.component.html',
  styleUrls: ['./my-quiz-list.component.scss'],
  imports: [CommonModule, MatCardModule, MatTableModule, MatButtonModule],
})
export class MyQuizListComponent implements OnInit {
  displayedColumns: string[] = [
    'title',
    'description',
    'numQuestions',
    'label',
    'status',
    'edit',
  ];
  quizzes: QuizListItem[] = [];
  loading = true;
  errorMessage = '';

  constructor(private quizService: QuizService, private router: Router) {}

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
          slug: quiz?.slug ?? '',
        }));
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load your quizzes. Please try again.';
        this.loading = false;
      },
    });
  }

  editQuiz(quiz: QuizListItem): void {
    this.router.navigate(['/quiz/builder', quiz.slug]);
  }
}
