import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeatherIconsComponent } from '../feather-icons/feather-icons.component';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-congratulations-card',
  imports: [
    FormsModule,
    FeatherIconsComponent,
    MatIcon, 
    MatButtonModule
  ],
  templateUrl: './congratulations-card.component.html',
  styleUrl: './congratulations-card.component.scss'
})
export class CongratulationsCardComponent {
  @Input() userName: string = "User";
  @Input() message: string = "You are successfully registered with CodeMerit. Start the Onboarding Steps to get started.";
  @Input() action: string = "Start Skill Rating";
  constructor() {
   
  }

  handleAction(){
  //handle actions like Start Self Rating, Start a Quiz
  }
}
