import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MasterService } from '@core/service/master.service';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { CodeSnippetComponent } from '@shared/components/code-snippet/code-snippet.component';
import { MySubjectsComponent } from '@shared/components/my-subjects/my-subjects.component';
import { RecentActivityComponent } from '@shared/components/recent-activity/recent-activity.component';
import { RecentCommentsComponent } from '@shared/components/recent-comments/recent-comments.component';
import { ReportCardWidgetComponent } from '@shared/components/report-card-widget/report-card-widget.component';
import { SubjectCardWidgetComponent } from '@shared/components/subject-card-widget/subject-card-widget.component';
import { NgScrollbar } from 'ngx-scrollbar';

@Component({
  selector: 'app-dashboard-analytics',
  templateUrl: './dashboard-analytics.component.html',
  styleUrls: ['./dashboard-analytics.component.scss'],
  imports: [
    BreadcrumbComponent,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    NgScrollbar,
    ReportCardWidgetComponent,
    SubjectCardWidgetComponent,
    RecentCommentsComponent,
    RecentActivityComponent,
    // ChartSubscribersComponent,
    // ChartCard3Component,
    MySubjectsComponent,
    CodeSnippetComponent
  ],
})
export class AnalyticsDashboardComponent implements OnInit {
  title = 'Angular';
  subtitle = 'Objective Questions Attempts Summary';

  title3 = 'Skill Wise Coverage';
  subtitle3 = 'Number of readables marked as completed';

  constructor(private master: MasterService) {
    
  }

  ngOnInit() {
  }

  subjects = [
    {
      id: 1,
      title: 'HTML',
      lessonCount: 75,
      questionsCount: 1135,
      topicsCount: 25,
      description: 'HTML',
      progressColor: 'orange',
      progressPercentage: 10,
      locked: false
    },
    {
      id: 2,
      title: 'CSS',
      lessonCount: 75,
      questionsCount: 1135,
      topicsCount: 25,
      description: 'CSS',
      progressColor: 'Olive',
      progressPercentage: 10,
      locked: false
    },
    {
      id: 3,
      title: 'JavaScript',
      lessonCount: 75,
      questionsCount: 1135,
      topicsCount: 25,
      description: 'JavaScript',
      progressColor: 'orange',
      progressPercentage: 10,
      locked: false
    },
    {
      id: 4,
      title: 'TypeScript',
      lessonCount: 75,
      questionsCount: 1135,
      topicsCount: 25,
      description: 'TypeScript',
      progressColor: 'Olive',
      progressPercentage: 10,
      locked: false
    }
  ];

  categories = [
    {
      label: 'H',
      title: 'HTML',
      bookCount: 5,
      colorClass: 'bg-orange',
      percentage: 47,
    },
    {
      label: 'C',
      title: 'CSS',
      bookCount: 14,
      percentage: 47,
      colorClass: 'bg-purple',
    },
    {
      label: 'J',
      title: 'JavaScript',
      bookCount: 10,
      percentage: 47,
      colorClass: 'bg-green',
    },
    {
      label: 'T',
      title: 'TypeScript',
      bookCount: 21,
      percentage: 47,
      colorClass: 'bg-cyan',
    },
    { label: 'M', title: 'Express JS', bookCount: 6, percentage: 47, colorClass: 'bg-indigo' }
  ];

  achievements = [
    {
      name: 'Sudish Rajpure',
      message: 'Sudish earned the Redux Star badge.',
      timestamp: '7 hours ago',
      imgSrc: 'assets/images/users/user1.jpg',
      colorClass: 'col-green',
    },
    {
      name: 'Vallentina Doe',
      message: 'Vallentina earned the Angular Adept badge.',
      timestamp: '1 hour ago',
      imgSrc: 'assets/images/users/user1.jpg',
      colorClass: 'color-primary col-indigo',
    },
    {
      name: 'Sudish Singh',
      message: 'Sudish earned the Node Starter badge.',
      timestamp: 'Yesterday',
      imgSrc: 'assets/images/users/user1.jpg',
      colorClass: 'color-info col-orange',
      noBorder: true,
    },
    {
      name: 'Jalpesh',
      message: 'Jalpesh earned the JavaScript Aware badge.',
      timestamp: '1 hour ago',
      imgSrc: 'assets/images/users/user1.jpg',
      colorClass: 'color-primary col-red',
    },
  ];

  activities = [
    {
      timestamp: '5 mins ago',
      message: 'Jasmine registered from India.',
      statusClass: 'sl-primary',
    },
    {
      timestamp: '8 mins ago',
      message: 'Shelly registered from India.',
      statusClass: 'sl-danger',
    },
    {
      timestamp: '10 mins ago',
      message: 'Raman registered from India.',
      statusClass: 'sl-success',
    },
    {
      timestamp: '20 mins ago',
      message: 'Vinay registered from India.',
      statusClass: 'sl-primary',
    },
    {
      timestamp: '5 mins ago',
      message: 'Jalpesh registered from India.',
      statusClass: 'sl-success',
    },
  ];
}
