import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { fromEvent, Subject } from 'rxjs';
import { TopicFormComponent } from './dialogs/form-dialog/form-dialog.component';
import { TopicDeleteComponent } from './dialogs/delete/delete.component';
import {
  MAT_DATE_LOCALE,
  MatOptionModule,
  MatRippleModule,
} from '@angular/material/core';
import { TopicService } from './topics.service';
import { rowsAnimation, TableExportUtil } from '@shared';
import { formatDate, DatePipe, CommonModule, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { Direction } from '@angular/cdk/bidi';
import { TableShowHideColumnComponent } from '@shared/components/table-show-hide-column/table-show-hide-column.component';
import { TopicItem } from './topic-item.model';
@Component({
  selector: 'app-manage-topics',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  animations: [rowsAnimation],
  imports: [
    BreadcrumbComponent,
    FeatherIconsComponent,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatOptionModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    NgClass,
    MatRippleModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatPaginatorModule,
    TableShowHideColumnComponent,
  ],
})
export class TopicsComponent implements OnInit, OnDestroy {
  columnDefinitions = [
    { def: 'select', label: 'Checkbox', type: 'check', class: 'col-default', visible: true },
    { def: 'title', label: 'Name', type: 'text', class: 'col-title', visible: true },
    { def: 'subjectName', label: 'Subject', type: 'text', class: 'col-default', visible: true },
    {
      def: 'label',
      label: 'Level',
      type: 'text',
      class: 'col-default',
      visible: true,
    },
    { def: 'numQuestions', label: 'Questions', type: 'text', class: 'col-default', visible: true },
    { def: 'actions', label: 'Actions', type: 'actionBtn', class: 'col-default', visible: true },
  ];

  dataSource = new MatTableDataSource<TopicItem>([]);
  selection = new SelectionModel<TopicItem>(true, []);
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    public topicService: TopicService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh() {
    this.loadData();
  }

  getDisplayedColumns(): string[] {
    return this.columnDefinitions
      .filter((cd) => cd.visible)
      .map((cd) => cd.def);
  }

  loadData() {
    this.topicService.getAllTopics().subscribe({
      next: (data) => {
        console.log("TopicManager data", data);
        
        this.dataSource.data = data;
        this.isLoading = false;
        this.refreshTable();
        this.dataSource.filterPredicate = (data: TopicItem, filter: string) =>
          Object.values(data).some((value) =>
            value.toString().toLowerCase().includes(filter)
          );
      },
      error: (err) => console.error(err),
    });
  }

  private refreshTable() {
    this.paginator.pageIndex = 0;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filter = filterValue;
    console.log("TopicManager filter applied", filterValue);
  }

  addNew() {
    this.openDialog('add');
  }

  editCall(row: TopicItem) {
    this.openDialog('edit', row);
    console.log("TopicManager editCall", row);
  }

  openDialog(action: 'add' | 'edit', data?: TopicItem) {
    console.log("TopicManager openDialog", action, data);
    let varDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    } else {
      varDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(TopicFormComponent, {
      width: '500px',
      minWidth: '100vw',
      data: { topicItem: data, action },
      direction: varDirection,
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("TopicManager close result", result);
        if (action === 'add') {
          if(result.data)
          this.dataSource.data = [result.data, ...this.dataSource.data];
        } else {
          this.updateRecord(result);
        }
        this.refreshTable();
        this.showNotification(
          action === 'add' ? 'snackbar-success' : 'black',
          `Topic ${action === 'add' ? 'Add' : 'Edit'} Successful.`,
          'bottom',
          'center'
        );
      }
    });
  }

  private updateRecord(updatedRecord: TopicItem) {
    const index = this.dataSource.data.findIndex(
      (record) => record.id === updatedRecord.id
    );
    if (index !== -1) {
      this.dataSource.data[index] = updatedRecord;
      this.dataSource._updateChangeSubscription();
    }
  }

  deleteItem(row: TopicItem) {
    const dialogRef = this.dialog.open(TopicDeleteComponent, {
      data: row,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dataSource.data = this.dataSource.data.filter(
          (record) => record.id !== row.id
        );
        this.refreshTable();
        this.showNotification(
          'snackbar-danger',
          row.title+' deleted Successfully.',
          'bottom',
          'center'
        );
      }
    });
  }

  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition,
    placementAlign: MatSnackBarHorizontalPosition
  ) {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }

  exportExcel() {
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  removeSelectedRows() {
    const totalSelect = this.selection.selected.length;
    this.dataSource.data = this.dataSource.data.filter(
      (item) => !this.selection.selected.includes(item)
    );
    this.selection.clear();
    this.showNotification(
      'snackbar-danger',
      `${totalSelect} Record(s) Deleted Successfully...!!!`,
      'bottom',
      'center'
    );
  }
  onContextMenu(event: MouseEvent, item: TopicItem) {
    event.preventDefault();
    this.contextMenuPosition = {
      x: `${event.clientX}px`,
      y: `${event.clientY}px`,
    };
    if (this.contextMenu) {
      this.contextMenu.menuData = { item };
      this.contextMenu.menu?.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
}
