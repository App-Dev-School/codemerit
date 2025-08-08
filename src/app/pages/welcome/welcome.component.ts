import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { MatRippleModule } from '@angular/material/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { MasterService } from '@core/service/master.service';
import { AuthService } from '@core';
import { Router } from '@angular/router';
import { MySubjectsComponent } from '@shared/components/my-subjects/my-subjects.component';
import { LearnerWelcomeCardComponent } from '@shared/components/learner-welcome-card/learner-welcome-card.component';
import { ReportListComponent } from '@shared/components/report-list/report-list.component';
import { SubjectRole } from '@core/models/subject-role';
import { Observable } from 'rxjs';
import { ReportCardWidgetComponent } from '@shared/components/report-card-widget/report-card-widget.component';
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  imports: [CarouselModule, MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
    MatRippleModule,
    MatIconModule,
    LearnerWelcomeCardComponent,
    ReportCardWidgetComponent,
    ReportListComponent
  ],
  //  animations: [
  //     trigger('fadeOut', [
  //       transition(':leave', [
  //         style({ opacity: 1 }), // Set initial opacity
  //         animate('1.2s', style({ opacity: 0 })) // Animate to opacity 0 over 0.5 seconds
  //       ])
  //     ])
  //   ]
})
export class WelcomeComponent {
  public subjectRoleMap: SubjectRole[] = [];
  subject = "";
  subjectData : any;
  subjectsByRole: { [role: string]: SubjectRole[] } = {};
  limit: number = 10; // <==== Edit this number to limit API results
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    margin: 10,
    animateIn : true,
    animateOut:true,
    navSpeed: 700,
    navText: ['Previous', 'Next'],
    responsive: {
      0: {
        items: 1.5,
      },
      400: {
        items: 1.5,
      },
      740: {
        items: 3,
      },
      940: {
        items: 4,
      },
    },
    nav: true,
  };

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
  isBookmarked: boolean = false;
  showCard: boolean = true;

  constructor(private router: Router, private master: MasterService, private authService: AuthService) {
    // constructor code
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
      this.showCard = true;
    }, 5000);
  }

  removeItem(itemId: any) {
    if (typeof itemId == 'number') {
      console.log("removeItem ");
      //bad code
      this.engagements = this.engagements.filter(item => item.id != itemId)
    } else {
      this.engagements = this.engagements.filter(item => item.id > 1)
    }
  }

  bookmark(){
    this.isBookmarked = !this.isBookmarked;
  }

  toggleCard() {
    this.showCard = !this.showCard;
  }

  //Review above code


  onSubjectChange(subject: string){
    console.log("Home @onSubjectChange", subject);
    if(subject){
      this.router.navigate(['/dashboard/learn', subject]).then(() => {
        console.log('Navigation completed!');
      });
    }
  }
}
