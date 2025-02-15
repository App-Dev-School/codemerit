import { AsyncPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MasterService } from '@core/service/master.service';
import { Observable } from 'rxjs';

interface MySubject {
  title: string;
  learn_percentage: number;
  practice_percentage: number;
  description: string;
  image: string;
  class: string; // Class for the progress bar color
  labelClass: string; // Class for the label background color
}

@Component({
  selector: 'app-my-subjects',
  imports: [
    AsyncPipe,
    //RouterLink,
    NgClass,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
    MatRippleModule,
    MatIconModule,
    //MatProgressBar
  ],
  templateUrl: './my-subjects.component.html',
  styleUrl: './my-subjects.component.scss'
})
export class MySubjectsComponent implements OnInit {
  @Input() minimal = false;
  subjects: Observable<any>;
  @Output() subjectSelected = new EventEmitter<string>();
  @Output() onSubscribe = new EventEmitter<string>();
  isLoading = true;

  constructor(private master: MasterService) {
  }

  ngOnInit(): void {
    this.subjects = this.master.getMockMySubjectsData();
    this.isLoading = false;
    // setTimeout(() => {
    //   this.subjects = this.master.getMockMySubjectsData();
    //   this.isLoading = false;
    // }, 2000);
  }

  switchSubject(subjectName: string) {
    this.subjectSelected.emit(subjectName);
  }

  subscribeSubject(subjectName: string) {
    this.onSubscribe.emit(subjectName);
    //change state of subject
  }
}
