import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService } from '@core';
import { InitialRole } from '@core/models/initial-role.data';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { AdminDashboardData } from '../../dtos/admin-dashboard.model';
import { TimeseriesChartComponent } from '@shared/components/timeseries-chart/timeseries-chart.component';
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  imports: [
    //RouterLink,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatMenuModule,
    MatIconModule,
    TimeseriesChartComponent
  ]
})
export class MainComponent implements OnInit {
  selectedTimePeriod: string = 'Monthly';
  public initialRoles: InitialRole[] = AuthConstants.CURRENT_ROLE_OPTIONS;
  dashboard: AdminDashboardData;
  subject = "";
  title = 'LMS Stat';
  subtitle = 'LSMS Resource Overview';
  loading = true;

  constructor(private route: ActivatedRoute,
    private authService: AuthService,
    private masterService: MasterService,
    private router: Router,
    private snackService: SnackbarService) {
    console.log("MainComponent constructor", this.subject);
  }

  ngOnInit() {
    this.takeRouteParams();
    this.loadAdminDashboard();
  }

  loadAdminDashboard() {
    this.masterService.getAdminDashboard()
      .subscribe({
        next: (response) => {
          console.log('response:', response);
          //this.submitted = false;
          if (response && !response.error) {
            this.dashboard = response?.data;
          } else {
            this.loading = false;
            this.snackService.display('snackbar-dark', response?.message ?? "Error fetching dashboard.", 'bottom', 'center');
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackService.display('snackbar-dark', 'Error enrolling subject. Please try again.', 'bottom', 'center');
          console.error('Enroll Subject API Error:', error);
        },
      });
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

  goToQuestions() {
    this.router.navigate(['/admin/questions/list']);
  }

  goToQuestionViewer() {
    this.router.navigate(['/admin/questions/viewer']);
  }

  goToTopicManager() {
    this.router.navigate(['/admin/topics/list']);
  }

  goToUsers() {
    this.router.navigate(['/users/list']);
  }

  addNewUser() {
    this.router.navigate(['/users/create']);
  }

  manageLearning() {
    this.router.navigate(['/']);
  }

  viewAttempts() {
    this.router.navigate(['/app/subscription']);
  }
}