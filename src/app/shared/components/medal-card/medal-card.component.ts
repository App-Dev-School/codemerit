import { Component, Input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-medal-card',
  imports: [
    FormsModule,
    MatIconModule,
    MatButton
  ],
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
