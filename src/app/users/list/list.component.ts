import { SelectionModel } from '@angular/cdk/collections';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subject } from 'rxjs';
// import { ViewAppointmentFormComponent } from './dialogs/form-dialog/form-dialog.component';
// import { ViewAppointmentDeleteComponent } from './dialogs/delete/delete.component';
import { CommonModule, DatePipe, formatDate, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  MAT_DATE_LOCALE,
  MatOptionModule,
  MatRippleModule,
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { AuthService, User } from '@core';
import { rowsAnimation, TableExportUtil } from '@shared';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { FeatherIconsComponent } from '@shared/components/feather-icons/feather-icons.component';
import { TableShowHideColumnComponent } from '@shared/components/table-show-hide-column/table-show-hide-column.component';

@Component({
  selector: 'app-list-users',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
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
    DatePipe,
    TableShowHideColumnComponent,
  ],
})
export class ListUserComponent implements OnInit, OnDestroy {
  columnDefinitions = [
    { def: 'name', label: 'Name', type: 'text', visible: true },
    { def: 'country', label: 'Country', type: 'address', visible: true },
    { def: 'designation', label: 'Designation', type: 'text', visible: true },
    { def: 'email', label: 'Email', type: 'email', visible: true },
    { def: 'date', label: 'Join Date', type: 'date', visible: true },
    { def: 'verified', label: 'Status', type: 'text', visible: true },
    { def: 'actions', label: 'Actions', type: 'actionBtn', visible: true },
  ];

  dataSource = new MatTableDataSource<User>([]);
  selection = new SelectionModel<User>(true, []);
  contextMenuPosition = { x: '0px', y: '0px' };
  isLoading = true;
  private destroy$ = new Subject<void>();
  eventDetails: any = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild(MatMenuTrigger) contextMenu?: MatMenuTrigger;

  constructor(
    public httpClient: HttpClient,
    public dialog: MatDialog,
    public appointmentService: AuthService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.eventDetails = params;
    });

    //this.loadData(this.eventDetails.start);
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

  loadData(filterDate?: string) {
    //process to get only value
    this.appointmentService.getAllUsers().subscribe({
      next: (data) => {
        const users = data.data;
        console.log("NgListUser loadData", users);
        const filteredData = users;
        if (filterDate) {
          // Filter data based on the selected date
          const filteredData = data.filter((appointment) => {
            const appointmentDate = formatDate(
              new Date(appointment.date),
              'yyyy-MM-dd',
              'en'
            );
            const selectedDate = formatDate(
              new Date(filterDate),
              'yyyy-MM-dd',
              'en'
            );
            return appointmentDate === selectedDate; // Match by date
          });
          this.dataSource.data = filteredData;
          console.log("NgListUser filteredData", filteredData);

        } else {
          // If no filter date, load all data
          this.dataSource.data = users;
          console.log("NgListUser NO filteredData", data);
        }

        this.isLoading = false;
        this.refreshTable();

        this.dataSource.filterPredicate = (data: User, filter: string) =>
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
  }

  addNew() {
    //route to 
    //this.openDialog('add');
  }

  test(row: User) {
    console.log(row, " ###test");
      this.showNotification(
      'snackbar-danger',
      `${row.firstName} Successfully...!!!`,
      'bottom',
      'center'
    );
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
    const exportData = this.dataSource.filteredData.map((x) => ({
      FirstName: x.firstName,
      LastName: x.lastName,
      Email: x.email,
      Date: formatDate(new Date(x.createdAt), 'yyyy-MM-dd', 'en') || '',
      // Time: x.time,
      // Mobile: x.mobile,
      // Doctor: x.doctor,
      // Injury: x.injury,
      // AppointmentStatus: x.appointmentStatus,
      // VisitType: x.visitType,
      // PaymentStatus: x.paymentStatus,
      // InsuranceProvider: x.insuranceProvider,
      // Notes: x.notes,
    }));

    TableExportUtil.exportToExcel(exportData, 'excel');
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
  onContextMenu(event: MouseEvent, item: User) {
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