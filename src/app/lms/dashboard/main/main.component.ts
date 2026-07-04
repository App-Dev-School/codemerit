import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
    TimeseriesChartComponent,
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
  activeTooltip: string | null = null;

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

  get approvalRate(): number {
    const q = this.dashboard?.questions;
    if (!q?.totalQuestions) return 0;
    return Math.round((q.totalApproved / q.totalQuestions) * 100);
  }

  get correctRate(): number {
    const a = this.dashboard?.attempts;
    if (!a?.total) return 0;
    return Math.round((a.totalCorrect / a.total) * 100);
  }

  get wrongRate(): number {
    const a = this.dashboard?.attempts;
    if (!a?.total) return 0;
    return Math.round((a.totalWrong / a.total) * 100);
  }

  get triviaRate(): number {
    const q = this.dashboard?.questions;
    if (!q?.totalQuestions) return 0;
    return Math.round((q.totalTrivia / q.totalQuestions) * 100);
  }

  get pendingRate(): number {
    const q = this.dashboard?.questions;
    if (!q?.totalQuestions) return 0;
    return Math.round(((q.totalPending ?? 0) / q.totalQuestions) * 100);
  }

  get interviewRate(): number {
    const q = this.dashboard?.questions;
    if (!q?.totalQuestions) return 0;
    return Math.round(((q.totalGeneral ?? 0) / q.totalQuestions) * 100);
  }

  get topicsActiveRate(): number {
    const t = this.dashboard?.topics;
    if (!t?.total) return 0;
    return Math.round((t.totalActive / t.total) * 100);
  }

  get lessonsCompleteRate(): number {
    const l = this.dashboard?.lessons;
    if (!l?.totalLessonsCreated) return 0;
    return Math.round((l.totalCompleted / l.totalLessonsCreated) * 100);
  }

  goToLessons(): void {
    this.router.navigate(['/lms/lessons/list']);
  }

  goToCreateQuestion(): void {
    this.router.navigate(['/lms/questions/create']);
  }

  goToQuizzes(): void {
    this.router.navigate(['/lms/quizzes/list']);
  }

  goToCreateQuiz(): void {
    this.router.navigate(['/lms/quizzes/list']);
  }

  goToCreateTopic(): void {
    this.router.navigate(['/lms/topics/create']);
  }

  goToSubjectTracks(): void {
    this.router.navigate(['/lms/subject-tracks/list']);
  }

  openTooltip(name: string): void {
    this.activeTooltip = name;
  }

  closeTooltip(): void {
    this.activeTooltip = null;
  }

  raiseRequest(): void {
    this.snackService.display('snackbar-dark', 'Request feature coming soon. Please contact an admin for now.', 'bottom', 'center');
  }
}
