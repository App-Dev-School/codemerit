import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Direction } from '@angular/cdk/bidi';
import { MatDialog } from '@angular/material/dialog';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { SubjectTrackDeleteComponent } from './dialogs/delete/delete.component';
import { SubjectTrackFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { SubjectTrackItem } from './subject-track-item.model';
import { SubjectTrackService } from './subject-tracks.service';

@Component({
  selector: 'app-subject-tracks',
  templateUrl: './subject-tracks.component.html',
  styleUrls: ['./subject-tracks.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, BreadcrumbComponent],
})
export class SubjectTracksComponent implements OnInit {
  allTracks: SubjectTrackItem[] = [];
  isLoading = true;
  searchQuery = '';
  subjectFilter = '';
  currentPage = 0;
  readonly pageSize = 10;

  constructor(
    private dialog: MatDialog,
    private subjectTrackService: SubjectTrackService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.subjectTrackService.getAllSubjectTracks().subscribe({
      next: (data) => {
        this.allTracks = data;
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
        this.allTracks
          .map((t) => t.subjectName ?? '')
          .filter((s) => s.length > 0),
      ),
    ].sort();
  }

  get filteredTracks(): SubjectTrackItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    return this.allTracks.filter((t) => {
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.subjectName ?? '').toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q);
      const matchesSubject =
        !this.subjectFilter || t.subjectName === this.subjectFilter;
      return matchesSearch && matchesSubject;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredTracks.length / this.pageSize));
  }

  get paginatedTracks(): SubjectTrackItem[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredTracks.slice(start, start + this.pageSize);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(total - 1, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get rangeStart(): number {
    return this.filteredTracks.length === 0
      ? 0
      : this.currentPage * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(
      this.filteredTracks.length,
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

  addNew(): void {
    this.openDialog('add');
  }

  editCall(row: SubjectTrackItem): void {
    this.openDialog('edit', row);
  }

  openDialog(action: 'add' | 'edit', trackItem?: SubjectTrackItem): void {
    const varDirection: Direction =
      localStorage.getItem('isRtl') === 'true' ? 'rtl' : 'ltr';

    const dialogRef = this.dialog.open(SubjectTrackFormComponent, {
      width: '480px',
      maxWidth: '95vw',
      height: '90vh',
      maxHeight: '95vh',
      data: { action, trackItem },
      direction: varDirection,
      autoFocus: false,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      if (action === 'add') {
        if (result.data) this.allTracks = [result.data, ...this.allTracks];
      } else {
        this.updateRecord(result);
      }
      this.showNotification(
        action === 'add' ? 'snackbar-success' : 'black',
        `Subject Track ${action === 'add' ? 'created' : 'updated'} successfully.`,
        'bottom',
        'center',
      );
    });
  }

  private updateRecord(updated: SubjectTrackItem): void {
    const index = this.allTracks.findIndex((t) => t.id === updated.id);
    if (index !== -1) {
      this.allTracks = [
        ...this.allTracks.slice(0, index),
        updated,
        ...this.allTracks.slice(index + 1),
      ];
    }
  }

  deleteItem(row: SubjectTrackItem): void {
    const dialogRef = this.dialog.open(SubjectTrackDeleteComponent, {
      data: row,
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.allTracks = this.allTracks.filter((t) => t.id !== row.id);
        this.showNotification(
          'snackbar-danger',
          `"${row.title}" deleted successfully.`,
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
  ): void {
    this.snackBar.open(text, '', {
      duration: 2500,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }
}
