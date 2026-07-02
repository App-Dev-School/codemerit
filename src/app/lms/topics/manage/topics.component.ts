import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { Direction } from '@angular/cdk/bidi';
import { TopicFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { TopicDeleteComponent } from './dialogs/delete/delete.component';
import { TopicService } from './topics.service';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TopicItem } from './topic-item.model';

@Component({
  selector: 'app-manage-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
})
export class TopicsComponent implements OnInit {
  allTopics: TopicItem[] = [];
  isLoading = true;
  searchQuery = '';
  subjectFilter = '';
  currentPage = 0;
  readonly pageSize = 10;

  constructor(
    public dialog: MatDialog,
    public topicService: TopicService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.topicService.getAllTopics().subscribe({
      next: (data) => {
        this.allTopics = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  get subjects(): string[] {
    return [
      ...new Set(
        this.allTopics
          .map((t) => t.subjectName ?? '')
          .filter((s) => s.length > 0),
      ),
    ].sort();
  }

  get filteredTopics(): TopicItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.allTopics.filter((t) => {
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.subjectName ?? '').toLowerCase().includes(q);
      const matchesSubject =
        !this.subjectFilter || t.subjectName === this.subjectFilter;
      return matchesSearch && matchesSubject;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTopics.length / this.pageSize));
  }

  get paginatedTopics(): TopicItem[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredTopics.slice(start, start + this.pageSize);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(total - 1, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get rangeStart(): number {
    return this.filteredTopics.length === 0
      ? 0
      : this.currentPage * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(
      this.filteredTopics.length,
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
    this.loadData();
  }

  addNew() {
    this.openDialog('add');
  }

  editCall(row: TopicItem) {
    this.openDialog('edit', row);
  }

  openDialog(action: 'add' | 'edit', data?: TopicItem) {
    const varDirection: Direction =
      localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';

    const dialogRef = this.dialog.open(TopicFormComponent, {
      width: '500px',
      maxWidth: '95vw',
      height: '90vh',
      maxHeight: '95vh',
      data: { topicItem: data, action },
      direction: varDirection,
      autoFocus: false,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (action === 'add') {
          if (result.data) this.allTopics = [result.data, ...this.allTopics];
        } else {
          this.updateRecord(result);
        }
        this.showNotification(
          action === 'add' ? 'snackbar-success' : 'black',
          `Topic ${action === 'add' ? 'Add' : 'Edit'} Successful.`,
          'bottom',
          'center',
        );
      }
    });
  }

  private updateRecord(updated: TopicItem) {
    const index = this.allTopics.findIndex((t) => t.id === updated.id);
    if (index !== -1) {
      this.allTopics = [
        ...this.allTopics.slice(0, index),
        updated,
        ...this.allTopics.slice(index + 1),
      ];
    }
  }

  deleteItem(row: TopicItem) {
    const dialogRef = this.dialog.open(TopicDeleteComponent, { data: row });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.allTopics = this.allTopics.filter((t) => t.id !== row.id);
        this.showNotification(
          'snackbar-danger',
          row.title + ' deleted successfully.',
          'bottom',
          'center',
        );
      }
    });
  }

  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition,
    placementAlign: MatSnackBarHorizontalPosition,
  ) {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }
}
