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
import { TimeframeData, TimeseriesChartComponent } from '@shared/components/timeseries-chart/timeseries-chart.component';
import { AdminDashboardData } from '../../dtos/admin-dashboard.model';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTableModule,
    MatSelectModule,
    MatMenuModule,
    MatIconModule,
    TimeseriesChartComponent,
    FormsModule
  ]
})
export class MainComponent implements OnInit {
  currentModule: string;
  selectedTimePeriod: string = 'Monthly';
  public initialRoles: InitialRole[] = AuthConstants.CURRENT_ROLE_OPTIONS;
  dashboard: AdminDashboardData;
  timeframeData: any = {};
  usersTimeframe: any;
  quizzesTimeframe: any;
  attemptsTimeframe: any;
  questionsTimeframe: any;

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
    this.currentModule = 'Users';
    this.takeRouteParams();
    this.loadAdminDashboard();
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

  private transformTimeSeriesData(
    title: string,
    dailyData: { date: string; count: number }[],
    weeklyData: { week: string; count: number }[]
  ): TimeframeData {
    const daily = dailyData.map(item => ({
      key: item.date,
      value: item.count,
    }));

    const weekly = weeklyData.map(item => ({
      key: item.week,
      value: item.count,
    }));

    return { title, daily, weekly };
  }

  
  loadAdminDashboard() {
    this.masterService.getAdminDashboard()
      .subscribe({
        next: (response) => {
          console.log('response:', response);
          //this.submitted = false;
          if (response && !response.error) {
            this.dashboard = response?.data;
            //Form the analytics data
            if (this.dashboard) {
              this.usersTimeframe = this.transformTimeSeriesData(
                'Users',
                this.dashboard.timeSeries.daily.users,
                this.dashboard.timeSeries.weekly.users
              );

              this.questionsTimeframe = this.transformTimeSeriesData(
                'Questions',
                this.dashboard.timeSeries.daily.questions,
                this.dashboard.timeSeries.weekly.questions
              );

              this.quizzesTimeframe = this.transformTimeSeriesData(
                'Quizzes',
                this.dashboard.timeSeries.daily.quizzes,
                this.dashboard.timeSeries.weekly.quizzes
              );

              this.attemptsTimeframe = this.transformTimeSeriesData(
                'Attempts',
                this.dashboard.timeSeries.daily.attempts,
                this.dashboard.timeSeries.weekly.attempts
              );
              this.onModuleChange({value: this.currentModule});
            }
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

  onModuleChange(event: any) {
    console.log('Selected module:', event.value);
    this.currentModule = event.value;
    switch (this.currentModule) {
      case "Users":
        this.timeframeData = this.usersTimeframe;
        break;
      case "Quizzes":
        this.timeframeData = this.quizzesTimeframe;
        break;
      case "Attempts":
        this.timeframeData = this.attemptsTimeframe;
        break;
      case "Questions":
        this.timeframeData = this.questionsTimeframe;
        break;
    }
  }

}