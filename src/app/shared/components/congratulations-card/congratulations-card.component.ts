import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeatherIconsComponent } from '../feather-icons/feather-icons.component';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

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
  @Input() userName: string = "User";
  @Input() message: string = "You are successfully registered with CodeMerit. Select your Designation to get started.";
  @Input() action: string = "Pick Job Designation";
  constructor(private router: Router) {
   
  }

  handleAction(){
  this.router.navigate(['/app/select-job-role']);
  }
}
