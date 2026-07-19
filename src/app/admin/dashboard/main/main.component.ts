import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { MeritListWidgetComponent } from '@shared/components/merit-list-widget/merit-list-widget.component';
import {
  TimeframeData,
  TimeseriesChartComponent,
} from '@shared/components/timeseries-chart/timeseries-chart.component';
import {
  AdminDashboardData,
  DailySeriesItem,
  WeeklySeriesItem,
  emptyAdminDashboardData,
} from '../../dtos/admin-dashboard.model';
import { RingStatComponent } from './ring-stat.component';
import { SegmentedStatBarComponent } from './segmented-stat-bar.component';

const TREND_KEYS = ['Users', 'Questions', 'Quizzes', 'Attempts', 'Certificates', 'Badges'] as const;
type TrendKey = (typeof TREND_KEYS)[number];

const DASHBOARD_TABS = [
  { key: 'people', label: 'People' },
  { key: 'content', label: 'Content' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'trends', label: 'Trends & Activity' },
] as const;
type DashboardTabKey = (typeof DASHBOARD_TABS)[number]['key'];

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  imports: [
    DecimalPipe,
    DatePipe,
    TimeseriesChartComponent,
    MeritListWidgetComponent,
    SegmentedStatBarComponent,
    RingStatComponent,
  ],
})
export class MainComponent implements OnInit {
  dashboard: AdminDashboardData = emptyAdminDashboardData();
  loading = true;

  tabs = DASHBOARD_TABS;
  activeTab: DashboardTabKey = DASHBOARD_TABS[0].key;

  trendKeys = TREND_KEYS;
  selectedTrend: TrendKey = 'Users';
  trendsMap: Partial<Record<TrendKey, TimeframeData>> = {};
  activeTimeframe?: TimeframeData;

  constructor(
    private masterService: MasterService,
    private route: ActivatedRoute,
    private router: Router,
    private snackService: SnackbarService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const tab = params.get('tab') as DashboardTabKey | null;
      if (tab && DASHBOARD_TABS.some((t) => t.key === tab)) {
        this.activeTab = tab;
      } else {
        // Canonicalize the bare "main" URL to a specific tab so every view
        // is bookmarkable/shareable, without adding a history entry.
        this.router.navigate(['/admin/dashboard/main', DASHBOARD_TABS[0].key], {
          replaceUrl: true,
        });
      }
    });
    this.loadAdminDashboard();
  }

  selectTab(key: DashboardTabKey) {
    if (key === this.activeTab) return;
    this.router.navigate(['/admin/dashboard/main', key], { replaceUrl: true });
  }

  get pendingUsersCount(): number {
    return this.dashboard.people.users.pending;
  }

  get moderationQueueCount(): number {
    const q = this.dashboard.content.moderationQueue;
    return (
      q.pendingQuestions +
      q.unpublishedSubjects +
      q.unpublishedTopics +
      q.unpublishedSubjectTracks +
      q.unpublishedCertificationTracks
    );
  }

  loadAdminDashboard() {
    this.loading = true;
    this.masterService.getAdminDashboard().subscribe({
      next: (response) => {
        this.loading = false;
        if (response && !response.error && response.data?.overview) {
          this.dashboard = response.data;

          const daily = this.dashboard.trends.daily;
          const weekly = this.dashboard.trends.weekly;
          this.trendsMap = {
            Users: this.transformTimeSeriesData('Users', daily.users, weekly.users),
            Questions: this.transformTimeSeriesData('Questions', daily.questions, weekly.questions),
            Quizzes: this.transformTimeSeriesData('Quizzes', daily.quizzes, weekly.quizzes),
            Attempts: this.transformTimeSeriesData('Attempts', daily.attempts, weekly.attempts),
            Certificates: this.transformTimeSeriesData('Certificates', daily.certificates, weekly.certificates),
            Badges: this.transformTimeSeriesData('Badges', daily.badges, weekly.badges),
          };
          this.onTrendChange(this.selectedTrend);
        } else if (response && !response.error) {
          // Response succeeded but doesn't match the expected nested shape
          // (e.g. an older backend build still serving the pre-restructure
          // payload) — keep the zero-state dashboard rather than crash.
          console.error('Admin Dashboard API returned an unexpected response shape:', response);
          this.snackService.display(
            'snackbar-dark',
            'Dashboard data is in an unexpected format. Please check the API version.',
            'bottom',
            'center',
          );
        } else {
          this.snackService.display(
            'snackbar-dark',
            response?.message ?? 'Error fetching dashboard.',
            'bottom',
            'center',
          );
        }
      },
      error: (error) => {
        this.loading = false;
        this.snackService.display(
          'snackbar-dark',
          'Error fetching dashboard. Please try again.',
          'bottom',
          'center',
        );
        console.error('Admin Dashboard API Error:', error);
      },
    });
  }

  onTrendChange(key: TrendKey) {
    this.selectedTrend = key;
    this.activeTimeframe = this.trendsMap[key];
  }

  get overviewTiles(): { label: string; value: number }[] {
    const o = this.dashboard.overview;
    return [
      { label: 'Total Users', value: o.totalUsers },
      { label: 'Active Users', value: o.activeUsers },
      { label: 'New Today', value: o.newUsersToday },
      { label: 'Programs', value: o.totalPrograms },
      { label: 'Certification Tracks', value: o.totalCertificationTracks },
      { label: 'Subject Tracks', value: o.totalSubjectTracks },
      { label: 'Subjects', value: o.totalSubjects },
      { label: 'Topics', value: o.totalTopics },
      { label: 'Questions', value: o.totalQuestions },
      { label: 'Quizzes', value: o.totalQuizzes },
      { label: 'Lessons', value: o.totalLessons },
      { label: 'Quiz Attempts', value: o.totalQuizAttempts },
      { label: 'Question Attempts', value: o.totalQuestionAttempts },
      { label: 'Certificates Issued', value: o.certificatesIssued },
      { label: 'Badges Awarded', value: o.badgesAwarded },
    ];
  }

  get topLearnersForWidget() {
    return this.dashboard.people.topLearners.map((learner, index) => ({
      userId: learner.id,
      name: learner.name,
      image: learner.image ?? undefined,
      designationName: learner.level ?? undefined,
      username: '',
      rank: index + 1,
      masteryCount: learner.points,
    }));
  }

  goToQuestions() {
    this.router.navigate(['/lms/questions/list']);
  }

  goToQuestionViewer() {
    this.router.navigate(['/lms/questions/viewer']);
  }

  goToQuizzes() {
    this.router.navigate(['/lms/quizzes/list']);
  }

  goToLessons() {
    this.router.navigate(['/lms/lessons/list']);
  }

  goToTopicManager() {
    this.router.navigate(['/lms/topics/list']);
  }

  goToCertificationTracks() {
    this.router.navigate(['/lms/certification-tracks/list']);
  }

  goToSubjectTracks() {
    this.router.navigate(['/lms/subject-tracks/list']);
  }

  goToBadgeManagement() {
    this.router.navigate(['/admin/badges/grant']);
  }

  goToUsers() {
    this.router.navigate(['/users/list']);
  }

  addNewUser() {
    this.router.navigate(['/users/create']);
  }

  viewAttempts() {
    this.router.navigate(['/app/subscription']);
  }

  // ---------------------
  // Trend gap zero-fill — the API omits zero-activity buckets rather than
  // zero-filling them, which would otherwise distort the chart's evenly
  // spaced category axis. Both helpers key on the same UTC date/week format
  // the generated buckets use, so they align regardless of local timezone.
  // ---------------------
  private transformTimeSeriesData(
    title: string,
    dailyData: DailySeriesItem[],
    weeklyData: WeeklySeriesItem[],
  ): TimeframeData {
    const daily = this.fillDailySeries(dailyData, 30).map((item) => ({
      key: item.date,
      value: item.count,
    }));

    const weekly = this.fillWeeklySeries(weeklyData, 8).map((item) => ({
      key: item.week,
      value: item.count,
    }));

    return { title, daily, weekly };
  }

  private dateKeyUTC(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private fillDailySeries(items: DailySeriesItem[], days: number): DailySeriesItem[] {
    const byDate = new Map<string, number>();
    for (const item of items) {
      byDate.set(this.dateKeyUTC(new Date(item.date)), item.count);
    }

    const today = new Date();
    const result: DailySeriesItem[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
      const key = this.dateKeyUTC(d);
      result.push({ date: key, count: byDate.get(key) ?? 0 });
    }
    return result;
  }

  private isoWeekLabel(d: Date): string {
    const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0..Sun=6
    date.setUTCDate(date.getUTCDate() - dayNum + 3); // Thursday of this ISO week

    const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
    const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);

    const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
    return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  private fillWeeklySeries(items: WeeklySeriesItem[], weeks: number): WeeklySeriesItem[] {
    const byWeek = new Map<string, number>();
    for (const item of items) {
      byWeek.set(item.week, item.count);
    }

    const today = new Date();
    const result: WeeklySeriesItem[] = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i * 7));
      const key = this.isoWeekLabel(d);
      result.push({ week: key, count: byWeek.get(key) ?? 0 });
    }
    return result;
  }
}
