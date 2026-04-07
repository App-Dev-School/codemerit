import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import {
  TimeframeData,
  TimeseriesChartComponent,
} from '@shared/components/timeseries-chart/timeseries-chart.component';
import { LmsDashboardData } from '../../dtos/lms-dashboard.model';

@Component({
  selector: 'app-lms-dashboard-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    TimeseriesChartComponent,
    FormsModule,
  ],
})
export class LmsDashboardMainComponent implements OnInit {
  currentModule = 'Questions';
  selectedTimePeriod = 'Monthly';
  dashboard: LmsDashboardData;
  timeframeData: TimeframeData = { title: 'Questions', daily: [], weekly: [] };
  questionsTimeframe: TimeframeData = {
    title: 'Questions',
    daily: [],
    weekly: [],
  };
  quizzesTimeframe: TimeframeData = { title: 'Quizzes', daily: [], weekly: [] };
  attemptsTimeframe: TimeframeData = {
    title: 'Attempts',
    daily: [],
    weekly: [],
  };
  loading = true;

  constructor(
    private masterService: MasterService,
    private router: Router,
    private snackService: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  private transformTimeSeriesData(
    title: string,
    dailyData: { date: string; count: number }[] = [],
    weeklyData: { week: string; count: number }[] = [],
  ): TimeframeData {
    return {
      title,
      daily: dailyData.map((item) => ({ key: item.date, value: item.count })),
      weekly: weeklyData.map((item) => ({ key: item.week, value: item.count })),
    };
  }

  loadDashboard(): void {
    this.loading = true;
    this.masterService.getLmsDashboard().subscribe({
      next: (response) => {
        if (response && !response.error) {
          this.applyDashboardData(response);
        } else {
          this.masterService
            .getMockAdminDashboard()
            .subscribe((mockResponse) => {
              this.applyDashboardData(mockResponse);
            });
        }
      },
      error: () => {
        this.loading = false;
        this.snackService.display(
          'snackbar-dark',
          'Error loading LMS dashboard. Please try again.',
          'bottom',
          'center',
        );
      },
    });
  }

  private applyDashboardData(response: any): void {
    //clean up on destroy
    setTimeout(() => {
      this.loading = false;
    }, 2000);
    this.dashboard = response?.data ?? response;
    const daily = this.dashboard?.timeSeries?.daily;
    const weekly = this.dashboard?.timeSeries?.weekly;

    this.questionsTimeframe = this.transformTimeSeriesData(
      'Questions',
      daily?.questions ?? [],
      weekly?.questions ?? [],
    );
    this.quizzesTimeframe = this.transformTimeSeriesData(
      'Quizzes',
      daily?.quizzes ?? [],
      weekly?.quizzes ?? [],
    );
    this.attemptsTimeframe = this.transformTimeSeriesData(
      'Attempts',
      daily?.attempts ?? [],
      weekly?.attempts ?? [],
    );

    this.onModuleChange({ value: this.currentModule });
  }

  onModuleChange(event: any): void {
    this.currentModule = event.value;
    switch (this.currentModule) {
      case 'Questions':
        this.timeframeData = this.questionsTimeframe;
        break;
      case 'Quizzes':
        this.timeframeData = this.quizzesTimeframe;
        break;
      case 'Attempts':
        this.timeframeData = this.attemptsTimeframe;
        break;
    }
  }

  goToQuestions(): void {
    this.router.navigate(['/lms/questions/list']);
  }

  goToQuestionViewer(): void {
    this.router.navigate(['/lms/questions/viewer']);
  }

  goToTopicManager(): void {
    this.router.navigate(['/lms/topics/list']);
  }
}
