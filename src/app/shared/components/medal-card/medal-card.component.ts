import { Component, Input, output } from '@angular/core';
@Component({
  selector: 'app-medal-card',
  imports: [],
  templateUrl: './medal-card.component.html',
  styleUrls: ['./medal-card.component.scss',
    './star-rating-effect.scss'
  ]
})
export class MedalCardComponent {
  @Input() userName = 'Guest';
  title = 'Quick Self Skill Evaluation';
  @Input() message = 'You have won the Explorer badge for completing the self skill rating.';
  @Input() action = 'selfRating';
  medalAction = output<string>();
  messages = [
    "Begin Your Full-Stack Journey 🚀",
    "Start Building Your Skills",
    "Keep Growing Every Day",
    "Level Up Your Skills",
    "Upskill to Stay Ahead",
    "Turn Skills Into a Career",
    "Take the Next Step"
  ];

  constructor() {
    //this.title = this.getRandomMessage();
  }

  getRandomMessage() {
    return this.messages[Math.floor(Math.random() * this.messages.length)];
  }

  handleAction() {
    this.medalAction.emit(this.action);
  }
}
