import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, User } from '@core';

@Component({
    selector: 'app-learner-welcome-card',
    imports: [MatButtonModule],
    templateUrl: './learner-welcome-card.component.html',
    styleUrl: './learner-welcome-card.component.scss'
})
export class LearnerWelcomeCardComponent implements OnInit {
authData : User;
isVisitor = true;
 constructor(private snackBar: MatSnackBar,
    private authService: AuthService,
    public dialog: MatDialog) {

  }
    ngOnInit() {
    this.authData = this.authService.currentUserValue;
    if(this.authData.token && this.authData.firstName && this.authData.id){
        this.isVisitor = false;
    }
    }

    startSkillRating(){

    }

}
