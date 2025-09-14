import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-topics-list',
  imports: [
    CommonModule,
    NgClass,
    MatCard,
    MatCardHeader, MatCardContent,
    MatCardSubtitle,
    MatTooltipModule,
    MatCardActions,
    MatButtonModule,
    MatChipsModule,
    MatRippleModule,
    MatIconModule
  ],
  templateUrl: './topics-list.component.html',
  styleUrl: './topics-list.component.scss'
})
export class TopicsListComponent {
  @Input() subjectTopics: any[];
  @Output() topicExplore = new EventEmitter<any>();
  @Output() topicQuiz = new EventEmitter<any>();

  constructor() {
  }

  onTopicExplore(topic: any) {
    this.topicExplore.emit(topic);
  }

  onTopicQuiz(topic: any) {
    this.topicQuiz.emit(topic);
  }
}
