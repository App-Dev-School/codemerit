import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeatherIconsComponent } from '../feather-icons/feather-icons.component';

@Component({
  selector: 'app-congratulations-card',
  imports: [
    FormsModule,
    FeatherIconsComponent
  ],
  templateUrl: './congratulations-card.component.html',
  styleUrl: './congratulations-card.component.scss'
})
export class CongratulationsCardComponent {
  
  constructor() {
   
  }
}
