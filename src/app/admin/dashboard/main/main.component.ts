import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService } from '@core';
import { InitialRole } from '@core/models/initial-role.data';
import { SnackbarService } from '@core/service/snackbar.service';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { SubscriptionTableWidgetComponent } from '@shared/components/subscription-table-widget/subscription-table-widget.component';
import { NgScrollbar } from 'ngx-scrollbar';
@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    imports: [
        RouterLink,
        BreadcrumbComponent,
        MatCardModule,
        MatButtonModule,
        MatTableModule,
        MatSelectModule,
        NgScrollbar,
        MatMenuModule,
        MatIconModule,
        SubscriptionTableWidgetComponent,
        //CourseProgressComponent
    ]
})
export class MainComponent implements OnInit {
  selectedTimePeriod: string = 'Monthly';
  public initialRoles : InitialRole[] = AuthConstants.CURRENT_ROLE_OPTIONS;

  subject= "";
  title = 'LMS Stat';
  subtitle = 'LSMS Resource Overview';
  
  constructor(private route: ActivatedRoute, 
    private authService: AuthService, 
    private router: Router,
    private snackService: SnackbarService) {
    console.log("MainComponent constructor", this.subject);
  }
  ngOnInit() {
    this.takeRouteParams();
  }

  //Implement for admin
  takeRouteParams() {
    const subject = this.route.snapshot.paramMap.get('subject');
    console.log("MainComponent ParamMap subject", subject);
    
    /********** CHECK ROUTE PARAM REQUESTS ***********/
    this.route.paramMap.subscribe(params => {
      if (params.get("subject")) {
        this.subject = params.get("subject");
        console.log("MainComponent ParamMap 2", this.subject);
      } else {
        this.subject = "";
      }
    });
    /********* CHECK ROUTE PARAM REQUESTS ***********/
  }

  goToQuestions(){
    this.router.navigate(['/admin/questions/list']);
  }

  goToTopicManager(){
    this.router.navigate(['/admin/topics/list']);
  }
}