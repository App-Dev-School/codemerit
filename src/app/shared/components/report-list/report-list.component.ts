import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JobRole, Subject } from '@core/models/subject-role';

@Component({
  selector: 'app-subject-role-map',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
  imports: [
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
  ],
})
export class ReportListComponent implements OnInit {
  @Input() data: JobRole[] = []; // direct JobRole array from API
  selected = new UntypedFormControl(0);

  @Output() subjectSelected = new EventEmitter<string>();

  ngOnInit(): void {
    console.log('JobRoles loaded:', this.data);
  }

  get roles(): JobRole[] {
    return this.data;
  }

  switchSubject(subjectName: string) {
    this.subjectSelected.emit(subjectName);
  }
}