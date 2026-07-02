import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService, User, Role } from '@core';

@Component({
  selector: 'app-topics-list',
  imports: [
    CommonModule,
    NgClass,
  ],
  templateUrl: './topics-list.component.html',
  styleUrl: './topics-list.component.scss'
})
export class TopicsListComponent {
  userData: User;
  userRole: Role;
  @Input() subjectTopics: any[];
  @Output() topicExplore = new EventEmitter<any>();
  @Output() topicQuiz = new EventEmitter<any>();

  constructor(private authService: AuthService) {
    this.userData = this.authService?.currentUserValue;
    this.userRole = this.userData.role;
  }

  onTopicExplore(topic: any) { this.topicExplore.emit(topic); }
  onTopicQuiz(topic: any) { this.topicQuiz.emit(topic); }
}
