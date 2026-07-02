import { CommonModule, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService, Role } from '@core';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import {
  QuizQuestionsFormComponent,
  QuestionFilterValue,
} from '@shared/components/quiz-questions-form/quiz-questions-form.component';
import { Subject } from 'rxjs';
import { QuestionDeleteComponent } from './dialogs/delete/delete.component';
import { FullQuestion } from './question-item.model';
import { QuestionAuthor, QuestionService } from './questions.service';

@Component({
  selector: 'app-manage-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
  imports: [
    BreadcrumbComponent,
    CommonModule,
    NgClass,
    FormsModule,
    QuizQuestionsFormComponent,
  ],
})
export class QuestionsComponent implements OnInit, OnDestroy {

  showFilterPanel = false;
  allQuestions: FullQuestion[] = [];
  isLoading = true;
  noResultsMessage = '';
  subjects: any[] = [];
  topics: any[] = [];
  authors: QuestionAuthor[] = [];
  currentFilters: QuestionFilterValue = {
    subject: null,
    topic: null,
    subjectIds: [],
    topicIds: [],
    level: '',
    authorId: 0,
  };

  searchQuery = '';
  currentPage = 0;
  readonly pageSize = 15;

  private destroy$ = new Subject<void>();

  constructor(
    public questionService: QuestionService,
    private masterService: MasterService,
    private snackService: SnackbarService,
    private router: Router,
    public dialog: MatDialog,
    public authService: AuthService,
  ) {}

  // ── Computed ──────────────────────────────────────────────

  get isAdmin(): boolean {
    const role = this.authService.currentUserValue?.role;
    return role === Role.Admin || role === Role.All;
  }

  get filteredQuestions(): FullQuestion[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.allQuestions;
    return this.allQuestions.filter(item =>
      this.getPlainText(item.question).toLowerCase().includes(q) ||
      item.subject?.title?.toLowerCase().includes(q) ||
      item.topics?.some(t => t.title?.toLowerCase().includes(q))
    );
  }

  get paginatedQuestions(): FullQuestion[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredQuestions.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredQuestions.length / this.pageSize);
  }

  get rangeStart(): number {
    return this.filteredQuestions.length === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.filteredQuestions.length);
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

  get hasActiveFilters(): boolean {
    return !!(
      this.currentFilters.subjectIds?.length ||
      this.currentFilters.topicIds?.length ||
      this.currentFilters.level ||
      this.currentFilters.authorId
    );
  }

  // ── Lifecycle ─────────────────────────────────────────────

  ngOnInit() {
    this.subjects = this.masterService.subjects;
    this.topics = this.masterService.topics;
    this.loadAuthors();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Data ──────────────────────────────────────────────────

  private loadAuthors() {
    this.questionService.getQuestionAuthors().subscribe({
      next: (authors) => { this.authors = authors; this.loadData(); },
      error: () => { this.authors = []; this.loadData(); },
    });
  }

  loadData() {
    this.isLoading = true;
    this.currentPage = 0;
    this.questionService.getQuestionsWithFilters(false, this.currentFilters).subscribe({
      next: (data) => {
        this.allQuestions = data as FullQuestion[];
        this.noResultsMessage = data.length ? '' : 'No questions found for the selected filters.';
        this.isLoading = false;
      },
      error: (err) => {
        this.allQuestions = [];
        this.isLoading = false;
        this.noResultsMessage = err?.error?.message ?? err?.message ?? 'Unable to load questions. Please try again.';
      },
    });
  }

  refresh() { this.loadData(); }

  onFiltersApplied(filters: QuestionFilterValue) {
    this.currentFilters = filters;
    this.showFilterPanel = false;
    this.loadData();
  }

  onSearchChange() {
    this.currentPage = 0;
  }

  toggleFilterPanel() {
    this.showFilterPanel = !this.showFilterPanel;
  }

  // ── Navigation ────────────────────────────────────────────

  addNew() { this.router.navigate(['/lms/questions/create']); }

  navigateToViewer() { this.router.navigate(['/lms/questions/viewer']); }

  editCall(row: FullQuestion) {
    if (!this.canEditQuestion(row)) {
      this.snackService.display('snackbar-dark', 'Whitelisted questions can only be edited by admins.', 'bottom', 'center');
      return;
    }
    this.router.navigate(['/lms/questions/update', row.slug]);
  }

  deleteItem(row: FullQuestion) {
    const dialogRef = this.dialog.open(QuestionDeleteComponent, { data: row });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.allQuestions = this.allQuestions.filter(r => r.id !== row.id);
        this.snackService.display('snackbar-danger', 'Question deleted successfully.', 'bottom', 'center');
      }
    });
  }

  // ── Pagination ────────────────────────────────────────────

  prevPage() { if (this.currentPage > 0) this.currentPage--; }

  nextPage() { if (this.currentPage < this.totalPages - 1) this.currentPage++; }

  goToPage(page: number) { this.currentPage = page; }

  // ── Helpers ───────────────────────────────────────────────

  canEditQuestion(row: FullQuestion): boolean {
    return this.isAdmin || !this.isWhitelisted(row);
  }

  isWhitelisted(row: FullQuestion): boolean {
    const flag = row?.isWhitelisted;
    return (flag !== undefined && flag !== null && flag !== '') ? Number(flag) === 1 : false;
  }

  getPlainText(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  }

  getLevelDisplay(level: number | string): string {
    const map: Record<string, string> = { '1': 'Easy', '2': 'Intermediate', '3': 'Advanced' };
    return map['' + level] ?? 'Level ' + level;
  }
}
