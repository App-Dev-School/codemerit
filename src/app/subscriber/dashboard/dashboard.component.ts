import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TopicsListComponent } from '@shared/components/topics-listing/topics-list.component';

import { AsyncPipe, JsonPipe, NgStyle, NgTemplateOutlet } from '@angular/common';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService } from '@core';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { slideInOutAnimation } from '@shared/animations';
import { GoalPathComponent } from '@shared/components/goal-path/goal-path.component';
import { MeritListWidgetComponent } from '@shared/components/merit-list-widget/merit-list-widget.component';
import { SubjectPerformanceCardComponent } from '@shared/components/subject-performance/subject-performance-card.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [slideInOutAnimation],
  imports: [
    JsonPipe,
    AsyncPipe,
    NgTemplateOutlet,
    MatTabsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatChip, MatChipSet,
    TopicsListComponent,
    MeritListWidgetComponent,
    SubjectPerformanceCardComponent,
    GoalPathComponent,
    NgStyle
]
})
export class DashboardComponent implements OnInit {
  showContent = true;
  subject = "";
  subjectData : any;
  subjectTopics$ : Observable<any>;
  courseChartConfig = {
  showTitle: false,
  showSubtitle: false,
  showIcon: false,
  showLegend: false
 };
  //For displaying test data
  debugDisplay = true;
  constructor(private master: MasterService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackService: SnackbarService
  ) {
    console.log("LearnerDashoard currentUser", this.authService.currentUser);
  }

  // // You can also control the animation state dynamically
  // toggleSlide() {
  //   this.slideAnimation = (this.slideAnimation === 'in') ? 'out' : 'in';
  // }
  
  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Animation trigger can be based on route change
        this.showContent = false; // Hide content when navigation starts
      }

      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        // Ensure content is shown when navigation is complete
        this.showContent = true;
      }
    });
    this.takeRouteParams();
    // if(this.subject){
    //   this.onSubjectChange(this.subject);
    // }
  }

  takeRouteParams() {
    //const subject = this.route.snapshot.paramMap.get('subject');
    //console.log("MyDash ParamMap subject", subject);
    this.route.paramMap.subscribe(params => {
      console.log("MyDash @RouteParam change detected =>", params.get("subject"));
      if (params.get("subject")) {
        this.subject = params.get("subject");
        if(this.subject){
          this.onSubjectChange(this.subject);
        }
      }else{
        this.subject = "";
      }
    });
  }

  onSubjectChange(subject: string){
    this.subject = subject ? subject : "";
    console.log("LearnerDashoard @onSubjectChange", subject);
    if(this.subject){
      this.master.fetchSubjectData(this.subject).subscribe((subject) => {
        this.subjectData = subject;
        console.log("LearnerDashoard #1 @subjectData", subject);
      });
      this.subjectTopics$ = this.master.fetchAllSubjectTopics(this.subject);
      console.log("LearnerDashoard #2 @subjectTopics", this.subjectTopics$);
    }
  }

  onSubscribe(subject: string) {
    console.log("LearnerDashoard onSubscribe", subject);
    this.snackService.display('snackbar-dark',subject+' added to learning list!','bottom','center');
  }

  viewMeritList(){
    this.snackService.display('snackbar-dark','Only Top 5 members are listed currently.','bottom','center');
  }

  goToSubjects(){
    this.router.navigate(['/dashboard', this.subject]);
  }
}
