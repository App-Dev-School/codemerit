import { AsyncPipe, JsonPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-my-subjects',
  imports: [
    AsyncPipe,
    NgClass, JsonPipe,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
    MatRippleModule,
    MatIconModule,
  ],
  templateUrl: './my-subjects.component.html',
  styleUrl: './my-subjects.component.scss'
})
export class MySubjectsComponent {
  minimal = false;
  @Input() subjects: Observable<any>;
  @Output() subjectSelected = new EventEmitter<string>();
  @Output() onSubscribe = new EventEmitter<string>();
  isLoading = true;

  constructor() {
  }

  switchSubject(subjectName: string) {
    this.subjectSelected.emit(subjectName);
  }

  subscribeSubject(subjectName: string) {
    this.onSubscribe.emit(subjectName);
    //change state of subject
  }
}
