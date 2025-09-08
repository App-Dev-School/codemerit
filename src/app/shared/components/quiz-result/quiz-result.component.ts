
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { QuizResult } from '@core/models/quiz';
import { NgScrollbar } from 'ngx-scrollbar';
import { QuizProgressComponent } from '../quiz-progress/quiz-progress.component';
import { TopicsScore } from '../topic-wise-score/topics-score.component';

@Component({
  selector: 'app-quiz-result',
  templateUrl: './quiz-result.component.html',
  styleUrl: './quiz-result.component.scss',
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    NgScrollbar,
    NgTemplateOutlet,
    TopicsScore,
    QuizProgressComponent
  ]
})
export class QuizResultComponent {
  @Input() result: QuizResult;
  //should be a part of the quizResult
  topicWiseScore = [
    {
      label: 'HTML',
      percentage: 76,
      class: 'bg-green',
      labelClass: 'bg-green text-white',
    },
    {
      label: 'CSS',
      percentage: 67,
      class: 'bg-red',
      labelClass: 'bg-red text-white',
    },
    {
      label: 'JavaScript',
      percentage: 78,
      class: 'bg-indigo',
      labelClass: 'bg-indigo text-white',
    },
    {
      label: 'Java',
      percentage: 87,
      class: 'bg-orange',
      labelClass: 'bg-orange text-white',
    },
    {
      label: 'Spring Boot',
      percentage: 91,
      class: 'bg-dark',
      labelClass: 'bg-dark text-white',
    },
  ];

  constructor(){
    console.log("QuizResult Dumb Comp", this.result);
  }
}
