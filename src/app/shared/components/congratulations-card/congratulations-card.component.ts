import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { User } from '@core/models/user';
import { FeatherIconsComponent } from '../feather-icons/feather-icons.component';

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
export class CongratulationsCardComponent implements OnInit {
  @Input() user: User;
  @Input() message: string = "Skill Assessments and Practice Real-World Software Development";
  @Input() action: string = "Explore Tech Roles";
  constructor(private router: Router) {
    console.log("Congratulations Component", this.user);
  }

  ngOnInit(): void {
    console.log("Congratulations Component", this.user);
    if (this.user && !this.user?.userJobRoles?.length) {
      this.message = 'You are now registered with CodeMerit. Please select a Tech Role to get started.';
      this.action = "Select Your Role";
    } else {
      this.message = 'Hope you are doing well! Happy Learning!';
      this.action = "";
    }
  }

  handleAction() {
    this.router.navigate(['/app/select-job-role']);
  }
}
