import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-medal-card',
  imports: [ 
    FormsModule
  ],
  templateUrl: './medal-card.component.html',
  styleUrl: './medal-card.component.scss'
})
export class MedalCardComponent {
  @Input() userName: string = 'Guest';
  @Input() message: string = 'You have won the Explorer badge for completing the self skill rating.';
  constructor() {
  }

  onSubmit() {
    console.log('Value');
  }
}
