import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/service/auth.service';
import { QuizService } from 'src/app/quiz/quiz.service';

interface QuizListItem {
  title: string;
  description: string | null;
  numQuestions: number;
  label: string | null;
  status: string;
  isPublished: boolean;
  slug: string;
  author?: string;
}

@Component({
  selector: 'app-my-quiz-list',
  templateUrl: './my-quiz-list.component.html',
  styleUrls: ['./my-quiz-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class MyQuizListComponent implements OnInit {

  isAdmin = false;
  allQuizzes: QuizListItem[] = [];
  loading = true;
  errorMessage = '';

  searchQuery = '';
  currentPage = 0;
  readonly pageSize = 15;

  constructor(
    private quizService: QuizService,
    private router: Router,
    private authService: AuthService,
  ) {}

  // ── Computed ──────────────────────────────────────────────

  get filteredQuizzes(): QuizListItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.allQuizzes;
    return this.allQuizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(q) ||
      (quiz.description || '').toLowerCase().includes(q) ||
      (quiz.label || '').toLowerCase().includes(q) ||
      quiz.status.toLowerCase().includes(q)
    );
  }

  get paginatedQuizzes(): QuizListItem[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredQuizzes.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredQuizzes.length / this.pageSize);
  }

  get rangeStart(): number {
    return this.filteredQuizzes.length === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.filteredQuizzes.length);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const cur = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages = new Set<number>([0, total - 1, cur]);
    for (let d = -2; d <= 2; d++) {
      const p = cur + d;
      if (p >= 0 && p < total) pages.add(p);
    }
    return Array.from(pages).sort((a, b) => a - b);
  }

  // ── Lifecycle ─────────────────────────────────────────────

  ngOnInit(): void {
    this.isAdmin = this.authService.currentUserValue?.role === 'Admin';
    this.loadMyQuizzes();
  }

  // ── Data ──────────────────────────────────────────────────

  private loadMyQuizzes(): void {
    this.loading = true;
    this.errorMessage = '';
    this.quizService.getMyQuizzes().subscribe({
      next: (data) => {
        this.allQuizzes = (data ?? []).map((quiz: any) => ({
          title: quiz?.title ?? '-',
          description: quiz?.shortDesc ?? quiz?.description ?? null,
          numQuestions: Number(quiz?.totalQuestions) || 0,
          label: quiz?.label ?? null,
          status: quiz?.status ?? (quiz?.isPublished ? 'Published' : 'Draft'),
          isPublished: !!quiz?.isPublished,
          slug: quiz?.slug ?? '',
          author: quiz?.author ?? '',
        }));
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load your quizzes. Please try again.';
        this.loading = false;
      },
    });
  }

  refresh(): void { this.loadMyQuizzes(); }

  onSearchChange(): void { this.currentPage = 0; }

  // ── Navigation ────────────────────────────────────────────

  editQuiz(quiz: QuizListItem): void {
    this.router.navigate(['/quiz/builder', quiz.slug]);
  }

  // ── Pagination ────────────────────────────────────────────

  prevPage(): void { if (this.currentPage > 0) this.currentPage--; }

  nextPage(): void { if (this.currentPage < this.totalPages - 1) this.currentPage++; }

  goToPage(page: number): void { this.currentPage = page; }
}
