// chart-card4.component.ts
import { AsyncPipe, NgClass } from '@angular/common';
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
    NgClass,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
    MatRippleModule,
    MatIconModule
  ],
  templateUrl: './quiz-create.component.html',
  styleUrls: ['./quiz-create.component.scss']
})
export class QuizCreateComponent implements OnInit {
  @Input() minimal = true;
  @Input() currentCourse : number;
  courses: Observable<any>;
  @Output() subjectSelected = new EventEmitter<string>();
  @Output() onSubscribe = new EventEmitter<string>();
  isLoading = true;
  mode: 'dialog' | 'route' = 'route';
  userId?: string;

  //animation effect variables
  messages = [
    'Preparing Questions…',
    'Loading Quiz…',
    'Almost Ready…',
    'Get Ready!'
  ];

  currentMessage = this.messages[0];
  messageIndex = 0;
  finished = false;

  constructor(private master: MasterService, private router: Router,
    private route: ActivatedRoute,
    //private _bottomSheet: MatBottomSheet,
    @Optional() public dialogRef?: MatDialogRef<QuizCreateComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any) {
    if (this.dialogRef) {
      this.mode = 'dialog';
      this.userId = data?.id;
      console.log("QuizCreate Data ", data);

    } else {
      this.mode = 'route';
      this.route.paramMap.subscribe(params => {
        this.userId = params.get('id') ?? undefined;
      });
    }
  }

  ngOnInit(): void {
    console.log("QuizCreate ngOnInit", this.data);
    this.isLoading = false;
    this.startMessageCycle();
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
    console.log("pickJobRole", course);
     if (this.mode === 'dialog' && this.dialogRef) {
      this.dialogRef.close(course.slug);
     }
    this.onSubscribe.emit(course);
  }

  close() {
    if (this.mode === 'dialog' && this.dialogRef) {
      this.dialogRef.close('Dialog Closed');
    } else {
      this.router.navigate(['/dashboard/start']);
    }
  }

  ////
  startMessageCycle() {
    const interval = setInterval(() => {
      this.messageIndex++;

      if (this.messageIndex < this.messages.length) {
        this.currentMessage = this.messages[this.messageIndex];
      } else {
        clearInterval(interval);
        this.finished = true;
        this.onFinish();
      }
    }, 2000);
  }

  onFinish() {
    console.log('All messages finished!');
    // Any extra logic (navigate, API call, etc.)
  }

  startQuiz(event: any) {
    console.log('Start Quiz clicked!', event);
    // put your quiz start logic here
    this.dialogRef.close('Dialog Closed');
  }
}
