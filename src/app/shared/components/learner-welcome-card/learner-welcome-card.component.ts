import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService, User } from '@core';
@Component({
    selector: 'app-learner-welcome-card',
    imports: [MatButtonModule, MatIcon],
    templateUrl: './learner-welcome-card.component.html',
    styleUrl: './learner-welcome-card.component.scss'
})
export class LearnerWelcomeCardComponent implements OnInit {
    authData: User;
    isVisitor = true;
    constructor(private router: Router,
        private authService: AuthService,
        public dialog: MatDialog) {

    }
    ngOnInit() {
        this.authData = this.authService.currentUserValue;
        if (this.authData.token && this.authData.firstName && this.authData.id) {
            this.isVisitor = false;
        }
    }
    
    startSkillRating() {
        this.router.navigate(['/assessment/skill-rating']);
    }

    login() {
        this.router.navigate(['/test/landing']);
    }
}
