import { Component, Input, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';

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
  title = 'Upskill to Stay Ahead!';
  @Input() message = 'You have won the Explorer badge for completing the self skill rating.';
  @Input() action = 'selfRating';
  medalAction = output<string>();
  messages = [
    "Begin Your Full-Stack Journey 🚀",
    "Start Building Your Skills",
    "Keep Growing Every Day",
    "Level Up Your Coding Skills",
    "Upskill to Stay Ahead",
    "Turn Skills Into a Career",
    "Take the Next Step in Tech"
  ];

  constructor() {
    this.title = this.getRandomMessage();
  }

  getRandomMessage() {
    return this.messages[Math.floor(Math.random() * this.messages.length)];
  }

  handleAction() {
    this.medalAction.emit(this.action);
  }
}
