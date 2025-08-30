import { Component, Input } from '@angular/core';
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
  @Input() userName: string = 'Guest';
  @Input() message: string = 'You have won the Explorer badge for completing the self skill rating.';
  @Input() action: string = 'takeQuiz';
  constructor() {
  }

  handleAction() {
    console.log('Value');
  }
}
