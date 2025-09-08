// chart-card4.component.ts
import { AsyncPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatLineModule, MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import {
  MatBottomSheet,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '@core/service/master.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-course-picker',
  imports: [
    AsyncPipe,
    NgClass,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
    MatRippleModule,
    MatIconModule,
    MatBottomSheetModule
  ],
  templateUrl: './course-picker.component.html',
  styleUrls: ['./course-picker.component.scss']
})
export class CoursePickerComponent implements OnInit {
  @Input() minimal = true;
  courses: Observable<any>;
  @Output() subjectSelected = new EventEmitter<string>();
  @Output() onSubscribe = new EventEmitter<string>();
  isLoading = true;
  mode: 'dialog' | 'route' = 'route';
  userId?: string;
  pickerTheme = 'Default';//Default or Merit

  constructor(private master: MasterService, private router: Router,
    private route: ActivatedRoute,
    private _bottomSheet: MatBottomSheet,
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
    const allJobRoles = this.master.jobRoles;
    console.log("CoursePicker allJobRoles", allJobRoles);
    if(allJobRoles && allJobRoles.length > 0){
    const liveJobRoles = allJobRoles.filter(item => item.isPublished);
    console.log("CoursePicker liveJobRoles", liveJobRoles);
    // const myJobRoles = liveJobRoles.map(q => ({
    //   ...q,
    //   isSubscribed: q.id < 3 ? true : false,
    //   progress: 61 + 3*q.id
    // }));
    this.courses = of(liveJobRoles);
    }
    this.isLoading = false;
    // setTimeout(() => {
    //   this.subjects = this.master.getMockMySubjectsData();
    //   this.isLoading = false;
    // }, 2000);
  }

  switchJobRole(course: any) {
    this.subjectSelected.emit(course.slug);
    this.dialogRef.close(course.slug);
  }

  pickJobRole(course: any) {
    this.onSubscribe.emit(course);
    console.log("", course);
    if (this.mode === 'dialog' && this.dialogRef) {
      this.dialogRef.close(course.slug);
      console.log("CoursePickTest #1");
      //alert("Set Designation as "+course.title);
      this._bottomSheet.open(SetDesignationBottomSheetComponent);
    }else{
      this.router.navigate(['/dashboard/start', course.slug]);
    }
  }

  close() {
    if (this.mode === 'dialog' && this.dialogRef) {
      this.dialogRef.close('Dialog Closed');
    } else {
      this.router.navigate(['/dashboard/start']);
    }
  }
}
@Component({
    selector: 'app-enroll-course-bottom-sheet',
    templateUrl: 'confirm-course-enroll.html',
    imports: [MatLineModule]
})
export class SetDesignationBottomSheetComponent {
  constructor(
    private _bottomSheetRef: MatBottomSheetRef<SetDesignationBottomSheetComponent>
  ) { }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
