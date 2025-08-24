// chart-card4.component.ts
import { AsyncPipe, CommonModule, JsonPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '@core/service/master.service';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-course-picker',
    imports: [
      AsyncPipe,
    JsonPipe,
    //NgClass,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
    MatRippleModule,
    MatIconModule,
    ],
    templateUrl: './course-picker.component.html',
    styleUrls: ['./course-picker.component.scss']
})
export class CoursePickerComponent implements OnInit {
  @Input() minimal = false;
  courses: Observable<any>;
  @Output() subjectSelected = new EventEmitter<string>();
  @Output() onSubscribe = new EventEmitter<string>();
  isLoading = true;
  mode: 'dialog' | 'route' = 'route';
  userId?: string;

  constructor(private master: MasterService, private router: Router,
    private route: ActivatedRoute,
    @Optional() public dialogRef?: MatDialogRef<CoursePickerComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any) {
      if (this.dialogRef) {
      this.mode = 'dialog';
      this.userId = data?.id;
      console.log("CoursePicker Dialog Data ", data);
      
    } else {
      this.mode = 'route';
      this.route.paramMap.subscribe(params => {
        this.userId = params.get('id') ?? undefined;
      });
    }
  }

  ngOnInit(): void {
    this.courses = of(this.master.jobRoles);
    console.log("CoursePicker", this.master.jobRoles);
    
    //this.courses = this.master.getMockSubjects();
    this.isLoading = false;
    // setTimeout(() => {
    //   this.subjects = this.master.getMockMySubjectsData();
    //   this.isLoading = false;
    // }, 2000);
  }

  switchSubject(subjectName: string) {
    console.log("CoursePicker switchSubject", subjectName);
    //emit is needed for route only
    this.subjectSelected.emit(subjectName);
    this.dialogRef.close(subjectName);
  }

  subscribeSubject(subjectName: string) {
    this.onSubscribe.emit(subjectName);
    //change state of subject
  }

  close() {
    if (this.mode === 'dialog' && this.dialogRef) {
      this.dialogRef.close('Dialog Closed');
    } else {
      this.router.navigate(['/select-what']);
    }
  }
}
