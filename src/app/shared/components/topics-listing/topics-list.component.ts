import { AsyncPipe, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle, MatCardTitleGroup } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthService } from '@core';
import { QuizCreateModel } from '@core/models/dtos/GenerateQuizDto';
import { Observable } from 'rxjs';
import { TopicItem } from 'src/app/admin/topics/manage/topic-item.model';
import { QuizService } from 'src/app/quiz/quiz.service';
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
  @Output() subjectSelected = new EventEmitter<string>();
  generatingQuiz = false;
  loadingText = "Looking for a Quiz";

  constructor(private authService: AuthService, public router: Router, private quizService: QuizService) {
  }

  async launchTopicQuiz(topic: TopicItem) {
    console.log('QuizManager Invoked with Topic:', topic);
    this.generatingQuiz = true;
    this.loadingText = topic.title;
    const payload = new QuizCreateModel();
    payload.userId = this.authService.currentUserValue.id
    payload.topicIds = '' + topic.id;
    console.log('QuizManager Invoked with Topic:', payload);
    this.quizService
      .addQuiz(payload)
      .subscribe({
        next: (response) => {
          console.log('QuizManager CreateAPI response:', response);
          //this.submitted = false;
          if(response && response?.slug ){
          const slug = response?.slug;
          if(slug && slug !== ''){
          setTimeout(() => {
            //this.quizService.
            this.router.navigate(['quiz/take', slug]);
            this.generatingQuiz = false;
          }, 4000);
          }
          }
        },
        error: (error) => {
          //this.submitted = false;
          console.error('QuizManager CreateAPI Error:', error);
        },
      });
  }

  switchSubject(subjectName: string) {
    this.subjectSelected.emit(subjectName);
  }

  async launchTopicExplorer(slug: string) {
    this.router.navigate(["learn/topic/angular17"]);
  }
}
