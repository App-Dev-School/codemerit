import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Course, Subject } from '@core/models/subject-role';
import { JsonPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-subject-role-map',
  templateUrl: './report-list.component.html',
  styleUrls: ['./report-list.component.scss'],
  imports: [
    RouterLink,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIcon
  ],
})
export class ReportListComponent implements OnInit {
  @Input() data: Course[] = []; // direct JobRole array from API
  selected = new UntypedFormControl(0);

  @Output() subjectSelected = new EventEmitter<string>();

  ngOnInit(): void {
    console.log('JobRoles loaded:', this.data);
  }

  get roles(): Course[] {
    return this.data;
  }

  switchSubject(subjectName: string) {
    this.subjectSelected.emit(subjectName);
  }
}