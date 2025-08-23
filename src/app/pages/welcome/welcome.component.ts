import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '@core';
import { SubjectRole } from '@core/models/subject-role';
import { MasterService } from '@core/service/master.service';
import { CongratulationsCardComponent } from '@shared/components/congratulations-card/congratulations-card.component';
import { LearnerWelcomeCardComponent } from '@shared/components/learner-welcome-card/learner-welcome-card.component';
import { ReportListComponent } from '@shared/components/report-list/report-list.component';
import { MedalCardComponent } from "@shared/components/medal-card/medal-card.component";
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
  public subjectRoleMap: SubjectRole[] = [];
  subject = "";
  subjectData: any;
  subjectsByRole: { [role: string]: SubjectRole[] } = {};
  limit: number = 10; // <==== Edit this number to limit API results

  engagements = [
    {
      "id": 1,
      "title": "Do you know about Strict Mode in JavaScript?",
      "subject": "JavaScript",
      "topic": "ECMAScript",
      "type": "Ask",
      "imageUrl": "https://bazichic.com/uploads/images/docs/3111868324376422.jpg"
    },
    {
      "id": 2,
      "title": "Do you know how to access DOM using JS?",
      "subject": "JavaScript",
      "topic": "DOM",
      "type": "Ask",
      "imageUrl": "https://bazichic.com/uploads/images/docs/3111868324376422.jpg"
    },
    {
      "id": 3,
      "title": "Have you ever practised using Promise?",
      "subject": "JavaScript",
      "topic": "Promise",
      "type": "Ask",
      "imageUrl": "https://bazichic.com/uploads/images/docs/3111868324376422.jpg"
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

  constructor(private router: Router, private master: MasterService, private authService: AuthService) {
    // Implement Master Data Relationship
    this.master.fetchSubjectRoleMap().subscribe(data => {
      this.subjectRoleMap = data;
      this.subjectRoleMap.forEach(subject => {
        subject.roles.forEach(role => {
          if (!this.subjectsByRole[role]) {
            this.subjectsByRole[role] = [];
          }
          this.subjectsByRole[role].push(subject);
        });
      });
    });
    setInterval(() => {
      //After 5 secons ore more display the next user task
    }, 5000);
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
    if (typeof itemId == 'number') {
      console.log("removeItem ");
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
}
