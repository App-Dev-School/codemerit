import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

interface TopicScore {
  label: string;
  percentage: number;
  class: string; // Class for the progress bar color
  labelClass: string; // Class for the label background color
}

@Component({
    selector: 'app-topics-score',
    imports: [NgClass],
    templateUrl: './topics-score.component.html',
    styleUrl: './topics-score.component.scss'
})
export class TopicsScore {
  readonly topicScores = input<TopicScore[]>([]);
}