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
        MatTabsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule]
})
export default class UserComponent implements OnInit{
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
    //Do same thing in User Profile
  }

  takeRouteParams(){
    this.route.paramMap.subscribe(params => {
      if(params.get("userName")){
      this.userName = params.get("userName");
      console.log("NgViewUser userName", this.userName);
      if(this.userName != this.authData.username){
        this.selfView = false;
       }
      this.loadData();
     }else{
       //this.authService.redirectToErrorPage();
      //this.authService.logout("Invalid link. Please login again.");
      this.showNotification(
          "snackbar-danger",
          "Invalid User ID",
          "bottom",
          "center"
        );
     }
    });
  }

    public loadData() {
    this.loading = true;
    if(this.userName){
      if(navigator.onLine){
        //fullProfiles.json getFullProfile
        console.log("NgViewUser userName", this.userName);
        this.authService.getDummyProfile(this.userName).subscribe(
          (data : any) => {
            console.log("NgViewUser Dummy API", data);
            this.loading = false;
            if(!data.error){
              this.userDetail = data.data;
              console.log("NgViewUser userDetail", this.userDetail);
              if(this.userDetail == null || this.userDetail == undefined){
                this.noDataView = true;
                this.authService.redirectToErrorPage();
              }
            }else{
              this.noDataView = true;
              this.loading = false;
              console.log("NgViewUser Dummy API Failure", data);
            }
          },
          (error: HttpErrorResponse) => {
            this.loading = false;
            this.authService.redirectToErrorPage();
            console.log(error.name + " " + error.message);
          }
        );
      }else{
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
