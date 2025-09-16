import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeatherIconsComponent } from '../feather-icons/feather-icons.component';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { User } from '@core/models/user';

@Component({
  selector: 'app-congratulations-card',
  imports: [
    FormsModule,
    FeatherIconsComponent,
    MatButtonModule
  ],
  templateUrl: './congratulations-card.component.html',
  styleUrl: './congratulations-card.component.scss'
})
export class CongratulationsCardComponent {
  @Input() user: User;
  @Input() message: string = "Welcome Guest! CodeMerit offers a workplace to progressively up-skilling and gaining Work Experience in software solution development.";
  @Input() action: string = "Explore Tech Roles";
  constructor(private router: Router) {
    console.log("Congratulations Component", this.user);
   if(this.user && this.user.id > 0){
    if(this.user && this.user.email && this.user.designation > 0){
    this.message = 'Take a moment to self rate your tech skills.';
    this.action = "Start Skill Rating";
   }else{
    if(!this.user?.designation ){
    this.message = 'You are now registered with CodeMerit. Please select a Tech Role to get started.';
    this.action = "Select Your Role";
   }else{
   this.message = 'Hope you are doing well! Happy Learning!';
   this.action = "";
   }
   }
   }else{
    console.log("Default Guest");
   }
  }

  handleAction(){
  this.router.navigate(['/app/select-job-role']);
  }
}
