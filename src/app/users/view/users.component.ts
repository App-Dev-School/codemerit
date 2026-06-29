import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from '@core';
@Component({
  selector: 'app-user',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [
    DatePipe,
  ],
})
export default class UserComponent implements OnInit {
  authData: User;
  userName = '';
  loading = true;
  selfView = true;
  userDetail: any;
  noDataView = false;
  mySubjects = [
    {
      id: 1,
      title: 'HTML',
      image: 'assets/images/tech/html.png',
      color: '#ffffff',
      progress: 78,
    },
    {
      id: 2,
      title: 'CSS',
      image: 'assets/images/tech/css.png',
      color: '#ffffff',
      progress: 28,
    },
    {
      id: 1,
      title: 'JS',
      image: 'assets/images/tech/js.png',
      color: '#ffffff',
      progress: 71,
    },
    {
      id: 1,
      title: 'TypeScript',
      image: 'assets/images/tech/typescript.png',
      color: '#6937dcff',
      progress: 78,
    },
    {
      id: 1,
      title: 'Angular',
      image: 'assets/images/tech/angular.png',
      color: '#ffffff',
      progress: 28,
    },
    {
      id: 1,
      title: 'Nest',
      image: 'assets/images/tech/nest.png',
      color: '#ffffff',
      progress: 28,
    },
    {
      id: 1,
      title: 'Spring',
      image: 'assets/images/tech/spring.png',
      color: '#ffffff',
      progress: 28,
    },
    {
      id: 1,
      title: 'Docker',
      image: 'assets/images/tech/docker.png',
      color: '#ffffff',
      progress: 28,
    },
  ];
  courseChartConfig = {
    showTitle: false,
    showSubtitle: false,
    showIcon: false,
    showLegend: false,
  };

  get profileSubjects(): any[] {
    const apiSubjects =
      this.userDetail?.courseStats ?? this.userDetail?.mySubjects;
    if (Array.isArray(apiSubjects) && apiSubjects.length > 0) {
      return apiSubjects.map((subject: any) => {
        const title = subject?.title ?? subject?.name ?? subject?.courseName ?? 'Course';
        const score = this.normalizePercentage(subject?.score ?? subject?.progress ?? 0);
        const coverage = this.normalizePercentage(subject?.coverage ?? subject?.progress ?? 0);
        const avgAccuracy = this.normalizePercentage(subject?.avgAccuracy ?? subject?.progress ?? score);
        return {
          ...subject,
          title,
          score,
          avgAccuracy,
          coverage,
          image: subject?.image ?? 'assets/images/tech/placeholder.png',
          numTrivia: Number(subject?.numTrivia ?? 1),
        };
      });
    }

    return this.mySubjects.map((subject: any) => ({
      ...subject,
      score: this.normalizePercentage(subject?.progress ?? 0),
      avgAccuracy: this.normalizePercentage(subject?.progress ?? 0),
      coverage: this.normalizePercentage(subject?.progress ?? 0),
      numTrivia: 1,
    }));
  }

  private normalizePercentage(value: any): number {
    const parsed = Number(value ?? 0);
    if (Number.isNaN(parsed)) {
      return 0;
    }

    return Math.max(0, Math.min(100, parsed));
  }

  constructor(
    private route: ActivatedRoute,
    public ngRouter: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.authData = this.authService.currentUserValue;
    this.takeRouteParams();
  }

  takeRouteParams() {
    this.route.paramMap.subscribe((params) => {
      if (params.get('userName')) {
        const userNameParam = params.get('userName');
        this.userName = userNameParam;
        this.selfView = false;
      } else {
        this.selfView = true;
        this.userName = this.authData.username;
      }
      this.loadData();
    });
  }

  public loadData() {
    this.loading = true;
    if (this.userName) {
      if (navigator.onLine) {
        this.authService
          .getFullProfile(this.userName, this.authData.token)
          .subscribe(
            (data: any) => {
              this.loading = false;
              if (!data.error) {
                this.userDetail = data.data;
                if (this.userDetail == null || this.userDetail == undefined) {
                  this.noDataView = true;
                  this.authService.redirectToErrorPage();
                }
              } else {
                this.noDataView = true;
                this.loading = false;
                this.showNotification(
                  'snackbar-danger',
                  data.message,
                  'bottom',
                  'center',
                );
              }
            },
            (error: HttpErrorResponse) => {
              this.loading = false;
              this.authService.redirectToErrorPage();
              this.showNotification(
                'snackbar-danger',
                'Error fetching user details.',
                'bottom',
                'center',
              );
            },
          );
      } else {
        this.showNotification(
          'snackbar-danger',
          'No Internet Connection',
          'bottom',
          'center',
        );
      }
    }
  }

  showNotification(colorName, text, placementFrom, placementAlign) {
    this.snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }
}
