import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, User, Role } from '@core';

@Component({
  selector: 'app-topics-list',
  imports: [
    CommonModule,
    NgClass,
    MatIconModule,
  ],
  templateUrl: './topics-list.component.html',
  styleUrl: './topics-list.component.scss'
})
export class TopicsListComponent {
  userData: User;
  userRole: Role;
  @Input() subjectTopics: any[];
  // Gates the "Take Quiz" button — a visitor/non-enrolled learner can't take a
  // quiz here, so it shouldn't be offered (see subject-curriculum.component.ts
  // for the same rule applied to the subjectTracks-based renderer).
  @Input() isSubscribed = true;
  @Output() topicExplore = new EventEmitter<any>();
  @Output() topicQuiz = new EventEmitter<any>();

  constructor(private authService: AuthService) {
    this.userData = this.authService?.currentUserValue;
    this.userRole = this.userData.role;
  }

  onTopicExplore(topic: any) { this.topicExplore.emit(topic); }
  onTopicQuiz(topic: any) { this.topicQuiz.emit(topic); }
}
