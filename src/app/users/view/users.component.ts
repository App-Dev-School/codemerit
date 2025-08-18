import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, User } from '@core';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
@Component({
  selector: 'app-user',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [BreadcrumbComponent,
    DatePipe,
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule]
})
export default class UserComponent implements OnInit {
  authData: User;
  userName = "";
  loading = true;
  selfView = true;
  userDetail: any;
  noDataView = false;
  constructor(private route: ActivatedRoute,
    public ngRouter: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    public dialog: MatDialog) {

  }

  ngOnInit() {
    this.authData = this.authService.currentUserValue;
    this.takeRouteParams();
  }

  takeRouteParams() {
    this.route.paramMap.subscribe(params => {
      if (params.get("userName")) {
        this.userName = params.get("userName");
        if (this.userName != this.authData.username) {
          this.selfView = false;
        }
        this.loadData();
      } else {
        this.authService.logout("Invalid link. Please login again.");
        this.authService.redirectToErrorPage();
      }
    });
  }

  public loadData() {
    this.loading = true;
    if (this.userName) {
      if (navigator.onLine) {
        this.authService.getFullProfile(this.userName, this.authData.token).subscribe(
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
                "snackbar-danger",
                data.message,
                "bottom",
                "center"
              );
            }
          },
          (error: HttpErrorResponse) => {
            this.loading = false;
            this.authService.redirectToErrorPage();
            this.showNotification(
              "snackbar-danger",
              "Error fetching user details.",
              "bottom",
              "center"
            );
          }
        );
      } else {
        this.showNotification(
          "snackbar-danger",
          "No Internet Connection",
          "bottom",
          "center"
        );
      }
    }
  }

  showNotification(colorName, text, placementFrom, placementAlign) {
    this.snackBar.open(text, "", {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName
    });
  }
}
