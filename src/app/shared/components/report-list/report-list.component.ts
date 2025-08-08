import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader, MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { SubjectRole } from '@core/models/subject-role';

@Component({
    selector: 'app-subject-role-map',
    templateUrl: './report-list.component.html',
    styleUrl: './report-list.component.scss',
    imports: [
        MatTabsModule,
        MatIconModule,
        MatCardModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule
    ]
})
export class ReportListComponent implements OnInit {
   @Input() data: SubjectRole[];
    tabs = [];
  selected = new UntypedFormControl(0);
  subjectsByRole: { [role: string]: SubjectRole[] } = {};
  @Output() subjectSelected = new EventEmitter<string>();

    ngOnInit(): void {
    this.data.forEach(subject => {
      subject.roles.forEach(role => {
        if (!this.subjectsByRole[role]) {
          this.subjectsByRole[role] = [];
        }
        this.subjectsByRole[role].push(subject);
      });
    });
  }

    get roles(): string[] {
    return Object.keys(this.subjectsByRole);
  }

  addTab(selectAfterAdding: boolean) {
    this.tabs.push("New");
    if (selectAfterAdding) {
      this.selected.setValue(this.tabs.length - 1);
    }
  }
  removeTab(index: number) {
    this.tabs.splice(index, 1);
  }

  switchSubject(subjectName: string) {
    this.subjectSelected.emit(subjectName);
  }
}
