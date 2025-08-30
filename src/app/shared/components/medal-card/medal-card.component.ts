import { Component, input, output } from '@angular/core';
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
  styleUrl: './medal-card.component.scss'
})
export class MedalCardComponent {
  readonly userName = input<string>('Guest');
  readonly message = input<string>('You have won the Explorer badge for completing the self skill rating.');
  readonly action = input<string>('takeQuiz');
  medalAction = output<string>();
  constructor() {
  }

  handleAction() {
    this.medalAction.emit(this.action());
  }
}
