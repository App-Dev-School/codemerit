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
  constructor() {
  }

  onSubmit() {
    console.log('Value');
  }
}
