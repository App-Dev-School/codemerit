import { AsyncPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MasterService } from '@core/service/master.service';
import { Observable, of } from 'rxjs';

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
    this.subjects = of(this.master.subjects);
    this.isLoading = false;
    if(!this.master.subjects){
     alert("Required details could not be available to launch the app. Please refresh to continue.");
    }
  }

  switchSubject(subjectName: string) {
    this.subjectSelected.emit(subjectName);
  }

  subscribeSubject(subjectName: string) {
    this.onSubscribe.emit(subjectName);
    //change state of subject
  }
}
