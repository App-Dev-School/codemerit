import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { TopicsListComponent } from '@shared/components/topics-listing/topics-list.component';
import {
  NgApexchartsModule
} from 'ng-apexcharts';

import { AsyncPipe, JsonPipe } from '@angular/common';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService } from '@core';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { slideInOutAnimation } from '@shared/animations';
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
    BreadcrumbComponent,
    NgApexchartsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatChip, MatChipSet,
    TopicsListComponent,
    MeritListWidgetComponent,
    SubjectPerformanceCardComponent
  ]
})
export class DashboardComponent implements OnInit {
  showContent = true;
  subject = "";
  subjectData : any;
  subjectTopics$ : Observable<any>;
  //For displaying test data
  debugDisplay = false;
  constructor(private master: MasterService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackService: SnackbarService
  ) { }

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
    console.log("MyDash @onSubjectChange", subject);
    if(this.subject){
      this.master.fetchSubjectData(this.subject).subscribe((subject) => {
        this.subjectData = subject;
      });
      this.subjectTopics$ = this.master.fetchSubjectTopics(this.subject);
      //this.subjectTopics = this.master.getTopicsBySubject(this.resources, this.subject);
      //this.subjectTopics = this.subjectData.topics;
      console.log("MyDash #2 subjectTopics", this.subjectTopics$);
    }
  }

  onSubscribe(subject: string) {
    console.log("MyDash onSubscribe", subject);
    this.snackService.display('snackbar-dark',subject+' added to learning list!','bottom','center');
  }

  viewMeritList(){
    this.snackService.display('snackbar-dark','Only Top 3 members are listed currently.','bottom','center');
  }

  goToSubjects(){
    console.log("MyDash goToSubjects", this.subject);
    this.router.navigate(['/dashboard', this.subject]);
  }
}
