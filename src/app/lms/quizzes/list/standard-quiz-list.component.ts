import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { QuizService } from 'src/app/quiz/quiz.service';

interface StandardQuizItem {
  title: string;
  description: string | null;
  label: string | null;
  numQuestions: number;
  author: string;
  status: string;
  isPublished: boolean;
}

@Component({
  selector: 'app-standard-quiz-list',
  templateUrl: './standard-quiz-list.component.html',
  styleUrls: ['./standard-quiz-list.component.scss'],
  imports: [CommonModule, MatCardModule, MatTableModule],
})
export class StandardQuizListComponent implements OnInit {
  displayedColumns: string[] = [
    'title',
    'description',
    'numQuestions',
    'label',
    'author',
    'status',
  ];
  quizzes: StandardQuizItem[] = [];
  loading = true;
  errorMessage = '';

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.loadStandardQuizzes();
  }

  private loadStandardQuizzes(): void {
    this.loading = true;
    this.errorMessage = '';

    this.quizService.getStandardQuizzes().subscribe({
      next: (data) => {
        this.quizzes = (data ?? []).map((quiz: any) => ({
          title: quiz?.title ?? '-',
          description: quiz?.shortDesc ?? quiz?.description ?? '-',
          label: quiz?.label ?? '-',
          numQuestions: Number(quiz?.settings?.numQuestions) || 0,
          author:
            quiz?.createdBy?.name ??
            quiz?.author?.name ??
            quiz?.creator?.name ??
            quiz?.authorName ??
            '-',
          status:
            quiz?.status ??
            (quiz?.isPublished ? 'Published' : 'Draft'),
          isPublished: !!quiz?.isPublished,
        }));
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load quizzes. Please try again.';
        this.loading = false;
      },
    });
  }
}
