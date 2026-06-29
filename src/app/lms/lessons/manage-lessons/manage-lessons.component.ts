import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
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
  imports: [
    CommonModule,
    BreadcrumbComponent,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatSortModule,
  ],
})
export class ManageLessonsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'title',
    'subject',
    'topic',
    'sections',
    'author',
    'actions',
  ];

  dataSource = new MatTableDataSource<LessonListItem>([]);
  loading = true;
  errorMessage = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private lessonService: LessonService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadLessons();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadLessons(): void {
    this.loading = true;
    this.errorMessage = '';

    this.lessonService.getLessons(undefined, 'all').subscribe({
      next: (response: any) => {
        const lessons = Array.isArray(response?.data) ? response.data : [];

        this.dataSource.data = lessons.map((lesson: any) => ({
          id: lesson?.id,
          title: lesson?.title ?? '-',
          subject: lesson?.subject?.title ?? '-',
          topic: lesson?.topic?.title ?? '-',
          sections: lesson?.sections?.length ?? 0,
          author: [lesson?.user?.firstName, lesson?.user?.lastName]
            .filter(Boolean)
            .join(' ') || '-',
          slug: lesson?.slug ?? '',
        }));

        this.dataSource.filterPredicate = (
          data: LessonListItem,
          filter: string,
        ) => {
          const searchText = filter.trim().toLowerCase();
          return (
            data.title.toLowerCase().includes(searchText) ||
            data.subject.toLowerCase().includes(searchText) ||
            data.topic.toLowerCase().includes(searchText) ||
            data.author.toLowerCase().includes(searchText)
          );
        };

        this.loading = false;

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
      },
      error: () => {
        this.errorMessage = 'Unable to load lessons. Please try again.';
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
    this.loadLessons();
  }

  viewLesson(row: LessonListItem): void {
    if (row.slug) {
      this.router.navigate(['/learn/overview', row.slug]);
    }
  }
}
