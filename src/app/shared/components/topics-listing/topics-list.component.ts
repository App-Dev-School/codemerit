import { AsyncPipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle, MatCardTitleGroup } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TopicItem } from 'src/app/admin/topics/manage/topic-item.model';
@Component({
  selector: 'app-topics-list',
  imports: [
    NgClass,
    AsyncPipe,
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
  @Input() subjectTopics: Observable<any[]>;
  generatingQuiz = false;
  loadingText = "Looking for a Quiz";
  constructor(public router: Router) {
  }

  async launchTopicQuiz(topic:TopicItem) {
    const slug = topic.slug || 'testing'; //fix this issue
    this.generatingQuiz = true;
    this.loadingText = topic.title;
    //let parent do launch a quiz
    //if generate quiz api success redirect to quiz player
    //or handle error
    setTimeout(() => {
      this.router.navigate(['quiz/take', slug]);
      this.generatingQuiz = false;
    }, 4000);
  }

  async launchTopicExplorer(slug:string) {
    this.router.navigate(["learn/topic/angular17"]);
  }
}
