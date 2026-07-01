import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, Role } from '@core';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { LessonService } from 'src/app/learn/lesson.service';

interface LessonListItem {
  id: number;
  title: string;
  subject: string;
  topic: string;
  sections: number;
  author: string;
  slug: string;
}

@Component({
  selector: 'app-manage-lessons',
  templateUrl: './manage-lessons.component.html',
  styleUrls: ['./manage-lessons.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
})
export class ManageLessonsComponent implements OnInit {
  lessons: LessonListItem[] = [];
  loading = true;
  errorMessage = '';
  searchQuery = '';
  subjectFilter = '';
  currentPage = 0;
  readonly pageSize = 10;

  constructor(
    private lessonService: LessonService,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadLessons();
  }

  loadLessons(): void {
    this.loading = true;
    this.errorMessage = '';

    this.lessonService.getLessons(undefined, 'all').subscribe({
      next: (response: any) => {
        const raw = Array.isArray(response?.data) ? response.data : [];
        const currentUser = this.authService.currentUserValue;
        const isAdmin =
          currentUser?.role === Role.Admin || currentUser?.role === Role.All;
        const visible = isAdmin
          ? raw
          : raw.filter(
              (l: any) => Number(l?.user?.id) === Number(currentUser?.id),
            );

        this.lessons = visible.map((l: any) => ({
          id: l?.id,
          title: l?.title ?? '-',
          subject: l?.subject?.title ?? '-',
          topic: l?.topic?.title ?? '-',
          sections: l?.sections?.length ?? 0,
          author:
            [l?.user?.firstName, l?.user?.lastName].filter(Boolean).join(' ') ||
            '-',
          slug: l?.slug ?? '',
        }));

        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load lessons. Please try again.';
        this.loading = false;
      },
    });
  }

  get subjects(): string[] {
    return [
      ...new Set(this.lessons.map((l) => l.subject).filter((s) => s !== '-')),
    ].sort();
  }

  get filteredLessons(): LessonListItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.lessons.filter((l) => {
      const matchesSearch =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.subject.toLowerCase().includes(q) ||
        l.topic.toLowerCase().includes(q) ||
        l.author.toLowerCase().includes(q);
      const matchesSubject =
        !this.subjectFilter || l.subject === this.subjectFilter;
      return matchesSearch && matchesSubject;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredLessons.length / this.pageSize));
  }

  get paginatedLessons(): LessonListItem[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredLessons.slice(start, start + this.pageSize);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(total - 1, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get rangeStart(): number {
    return this.filteredLessons.length === 0
      ? 0
      : this.currentPage * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(
      this.filteredLessons.length,
      (this.currentPage + 1) * this.pageSize,
    );
  }

  onFilterChange(): void {
    this.currentPage = 0;
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  prevPage(): void {
    if (this.currentPage > 0) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) this.currentPage++;
  }

  refresh(): void {
    this.searchQuery = '';
    this.subjectFilter = '';
    this.currentPage = 0;
    this.loadLessons();
  }

  get isAdmin(): boolean {
    const role = this.authService.currentUserValue?.role;
    return role === Role.Admin || role === Role.All;
  }

  viewLesson(row: LessonListItem): void {
    if (row.slug) {
      this.router.navigate(['/learn/overview', row.slug]);
    }
  }

  addLesson(): void {
    this.router.navigate(['/lms/lessons/create-lesson']);
  }
}
