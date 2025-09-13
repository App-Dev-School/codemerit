import { CommonModule, JsonPipe } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { MatButtonModule } from "@angular/material/button";
import { MatLineModule } from "@angular/material/core";
import { Router } from "@angular/router";
import { AuthService } from "@core/service/auth.service";
import { SnackbarService } from "@core/service/snackbar.service";

@Component({
    selector: 'app-enroll-course-bottom-sheet',
    templateUrl: 'confirm-course-enroll.html',
    imports: [
        CommonModule,
        MatLineModule,
        MatButtonModule,
        JsonPipe
    ]
})
export class SetDesignationBottomSheetComponent {
  loading = false;
  loadingTxt = "";
  courseItem:any;
  constructor(
    public authService: AuthService,
    private snackService: SnackbarService,
    private router: Router,
    private _bottomSheetRef: MatBottomSheetRef<SetDesignationBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {
    console.log("SetDesignationBottomSheetComponent received", data);
    this.courseItem = data;
  }

  //remove duplicate
    doSetUserDesignation() {
    this.loading = true;
    console.log("SelectCourse @onSubscribe", this.courseItem);
    if (this.authService.currentUserValue) {
      const authData = this.authService.currentUserValue;
      const postData = {
        designation: this.courseItem?.id
      }
      if (this.courseItem && this.authService.currentUserValue.id) {
        this.loadingTxt = "Enrollment In Progress";
        let setDesignation = this.authService.updateUserAccount(authData.token, authData.id, postData);
        setDesignation.subscribe((res) => {
          this.loading = false;
          this._bottomSheetRef.dismiss(null);
          if (res) {
            if (!res.error && res.data) {
                this.snackService.display('snackbar-dark', res.message, 'bottom', 'center');
               //Route to new course dashboard
              this.router.navigate(['/dashboard/start', this.courseItem?.slug]);
              
            } else {
              console.log("Error Enrolling Course");
              this.snackService.display('snackbar-dark', 'Error Enrolling Course!', 'bottom', 'center');
            }
          }
        });
      } else {
        this.loading = false;
        this._bottomSheetRef.dismiss(null);
        this.snackService.display('snackbar-dark', "Sign in to add your designation and get started.", 'bottom', 'center');
        this.authService.redirectToLogin();
      }
      //alert("Here to call the Set Designation API. See this callback trigger in Course Dashboard. Is Requireed?");
      //this.snackService.display('snackbar-success',subject+' added to learning list!','bottom','center');
    }
  }

  dismiss(event: MouseEvent): void {
    this._bottomSheetRef.dismiss(null);
    this.snackService.display('snackbar-dark', ' added to learning list!', 'bottom', 'center');
    event.preventDefault();
  }
}