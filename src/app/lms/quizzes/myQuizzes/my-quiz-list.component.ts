import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { QuizService } from 'src/app/quiz/quiz.service';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { AuthService } from '@core/service/auth.service';

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
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatSortModule,
  ],
})
export class MyQuizListComponent
  implements OnInit, AfterViewInit
{
  isAdmin = false;
  displayedColumns: string[] = [
    'title',
    'description',
    'numQuestions',
    'label',
    'status',
    'edit',
  ];

  dataSource = new MatTableDataSource<QuizListItem>([]);

  loading = true;
  errorMessage = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private quizService: QuizService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin =
    this.authService.currentUserValue?.role ===
    'Admin';

  this.displayedColumns = [
    'title',
    'description',
    'numQuestions',
    'label',
    ...(this.isAdmin ? ['author'] : []),
    'status',
    'edit',
  ];
    this.loadMyQuizzes();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadMyQuizzes(): void {
    this.loading = true;
    this.errorMessage = '';

    this.quizService.getMyQuizzes().subscribe({
      next: (data) => {
        const quizzes: QuizListItem[] = (data ?? []).map((quiz: any) => ({
          title: quiz?.title ?? '-',
          description: quiz?.shortDesc ?? quiz?.description ?? '-',
          numQuestions: Number(quiz?.totalQuestions) || 0,
          label: quiz?.label ?? '-',
          status:
            quiz?.status ??
            (quiz?.isPublished ? 'Published' : 'Draft'),
          isPublished: !!quiz?.isPublished,
          slug: quiz?.slug ?? '',
          author: quiz?.author ?? '-',
        }));

        this.dataSource.data = quizzes;

        this.dataSource.filterPredicate = (
          data: QuizListItem,
          filter: string
        ) => {
          const searchText = filter.trim().toLowerCase();

          return (
            data.title.toLowerCase().includes(searchText) ||
            (data.description || '')
              .toLowerCase()
              .includes(searchText) ||
            (data.label || '').toLowerCase().includes(searchText) ||
            data.status.toLowerCase().includes(searchText)
          );
        };

        this.loading = false;

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      },
      error: () => {
        this.errorMessage =
          'Unable to load your quizzes. Please try again.';
        this.loading = false;
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  refresh(): void {
    this.loadMyQuizzes();
  }

  editQuiz(quiz: QuizListItem): void {
    this.router.navigate(['/quiz/builder', quiz.slug]);
  }
}