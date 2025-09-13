import { NgClass } from '@angular/common';
import { Component, Input, input } from '@angular/core';
import { QuizResultTopic } from '@core/models/quiz';

// interface TopicScore {
//   label: string;
//   percentage: number;
//   class: string; // Class for the progress bar color
//   labelClass: string; // Class for the label background color
// }

@Component({
    selector: 'app-topics-score',
    imports: [NgClass],
    templateUrl: './topics-score.component.html',
    styleUrl: './topics-score.component.scss'
})
export class TopicsScore {
  @Input() topicScores : QuizResultTopic[] = [];
}