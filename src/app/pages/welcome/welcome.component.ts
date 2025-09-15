import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService, User } from '@core';
import { Course } from '@core/models/subject-role';
import { MasterService } from '@core/service/master.service';
import { CongratulationsCardComponent } from '@shared/components/congratulations-card/congratulations-card.component';
import { LearnerWelcomeCardComponent } from '@shared/components/learner-welcome-card/learner-welcome-card.component';
import { ReportListComponent } from '@shared/components/report-list/report-list.component';
import { MedalCardComponent } from "@shared/components/medal-card/medal-card.component";
import { SnackbarService } from '@core/service/snackbar.service';
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
    MatRippleModule,
    MatIconModule,
    LearnerWelcomeCardComponent,
    CongratulationsCardComponent,
    ReportListComponent, MedalCardComponent],
  //  animations: [
  //     trigger('fadeOut', [
  //       transition(':leave', [
  //         style({ opacity: 1 }), // Set initial opacity
  //         animate('1.2s', style({ opacity: 0 })) // Animate to opacity 0 over 0.5 seconds
  //       ])
  //     ])
  //   ]
})
export class WelcomeComponent implements OnInit {
  public subjectRoleMap: Course[] = [];
  userName = "";
  userMessage = "";
  nextAction = "login";
  //clean up
  subjectData: any;
  subjectsByRole: { [role: string]: Course[] } = {};
  limit: number = 10; // <==== Edit this number to limit API results
  engagements = [
    {
      "id": 1,
      "title": "Have you heard about Strict Mode in JavaScript?",
      "subject": "JavaScript",
      "topic": "ECMAScript",
      "type": "Ask",
      "imageUrl": "assets/images/tech/javascript.png",
      "style": "right",
    },
    {
      "id": 2,
      "title": "Do you know how to access geo-location using JS?",
      "subject": "JavaScript",
      "topic": "DOM",
      "type": "Ask",
      "style": "right",
      "imageUrl": "assets/images/tech/javascript.png"
    },
    {
      "id": 3,
      "title": "How can you transform an Angular App for SEO?",
      "subject": "Angular",
      "topic": "SSR",
      "type": "Ask",
      "style": "left",
      "imageUrl": "assets/images/tech/angular.png"
    },
    {
      "id": 4,
      "title": "How will you invoke a method 1000 times concurrently in Java?",
      "subject": "Java",
      "topic": "Thread",
      "type": "Ask",
      "style": "right",
      "imageUrl": "assets/images/tech/java.png"
    },
    {
      "id": 5,
      "title": "What are Hot and Cold observables in RxJS?",
      "subject": "RxJS",
      "topic": "Selectors",
      "type": "Ask",
      "style": "left",
      "imageUrl": "assets/images/tech/rxjs.png"
    },
    {
      "id": 6,
      "title": "What are Pseudo selectors in CSS?",
      "subject": "CSS",
      "topic": "Selectors",
      "type": "Ask",
      "style": "left",
      "imageUrl": "assets/images/tech/css.png"
    }
  ];

  userTasks = [
    {
      "id": 1,
      "task": "Complete Project KT",
      "description": "Attend the project KT session. Take the Q&A to clear doubts and mark as complete.",
      "percentage": 5,
      "level": 1,
      "tag": "Initials"
    },
    {
      "id": 2,
      "task": "Remove Unreferenced Code",
      "description": "",
      "percentage": 5,
      "level": 1,
      "tag": "Work"
    },
    {
      "id": 2,
      "task": "Enable Component Communication",
      "description": "",
      "percentage": 5,
      "level": 1,
      "tag": "Work"
    },
    {
      "id": 2,
      "task": "Implement Question Edit",
      "description": "",
      "percentage": 5,
      "level": 1,
      "tag": "Work"
    },
    {
      "id": 2,
      "task": "Dialog Component Creation",
      "description": "",
      "percentage": 5,
      "level": 1,
      "tag": "Work"
    }
  ];

  constructor(private router: Router,
    private master: MasterService,
    private snackService: SnackbarService,
    private authService: AuthService) {
    this.authService.currentUser.subscribe((sub: User) => {
      this.authService.log("Welcome ", sub, "CurrentUser");
      if (sub && sub.firstName) {
        this.userName = sub.firstName;
        if (sub.designation) {
          this.nextAction = "selfRating";
          this.userMessage = "Tell us what you already know. Rate your skills, and we’ll personalize your learning path just for you.";
        } else {
          this.nextAction = "takeQuiz";
          this.userMessage = "Unlock a customized roadmap to level up faster. Generate a mock exam to assess your skills.";
        }
      } else {
        this.userMessage = "Start by listing your skills and rating yourself. We’ll adapt your journey to match your strengths and goals.";
        this.nextAction = "login";
      }
    });
    // Implement Master Data Relationship
    this.master.fetchJobRoleSubjectMapping().subscribe(data => {
      this.subjectRoleMap = data;
      this.subjectRoleMap.forEach(subject => {
        console.log("TaskJobRole ", subject);
        // subject.subjects.forEach(role => {
        //   if (!this.subjectsByRole[role]) {
        //     this.subjectsByRole[role] = [];
        //   }
        //   this.subjectsByRole[role].push(subject);
        // });
      });
    });
    //After 5 secons ore more display the next user task
    // setTimeout(() => {
    //   if(!this.authService.currentUserValue.email){
    //   this.snackService.display('snackbar-dark', 'Sign up to start up-skilling and transforming your tech path.', 'bottom', 'center');
    //   }
    // }, 10000);
  }

  ngOnInit(): void {
    if (!this.master.subjects.length || !this.master.topics.length) {
      this.master.dataLoaded$.subscribe((ready) => {
        if (ready) {
          console.log("Master Data Fetched Now : ", new Date().toISOString());
          console.log("Subjects : ", this.master.subjects);
          console.log("Topics : ", this.master.topics);
          console.log("Job Roles : ", this.master.jobRoles);
        }
      });
    } else {
      console.log("Master Data Exists : ");
      console.log("Subjects : ", this.master.subjects);
      console.log("Topics : ", this.master.topics);
      console.log("Job Roles : ", this.master.jobRoles);
    }
  }

  exploreLesson(itemId: any) {
    this.snackService.display('snackbar-dark', 'Feature coming soon!', 'bottom', 'center');
  }

  closeLesson(itemId: any) {
    if (typeof itemId == 'number') {
      //bad code
      this.engagements = this.engagements.filter(item => item.id != itemId)
    } else {
      this.engagements = this.engagements.filter(item => item.id > 1)
    }
  }


  onSubjectChange(subject: string) {
    console.log("Home @onSubjectChange", subject);
    if (subject) {
      this.router.navigate(['/dashboard/learn', subject]).then(() => {
        console.log('Navigation completed!');
      });
    }
  }

  //separate component and then implement
  handleAction(action: String) {
    console.log("Welcome Action", action);
    switch (action) {
      case "login":
        this.router.navigate(['/authentication/signin']).then(() => {
        });
        break;

      case "takeQuiz":
        this.router.navigate(['/take-quiz/explore']).then(() => {
        });
        break;
      default:
        break;
    }
  }
}
