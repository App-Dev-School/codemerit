import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { AuthService } from '@core/service/auth.service';
import { SnackbarService } from '@core/service/snackbar.service';

@Component({
  selector: 'app-enroll-course-bottom-sheet',
  templateUrl: 'confirm-course-enroll.html',
  imports: [CommonModule],
})
export class SetDesignationBottomSheetComponent {
  loading = false;
  loadingTxt = '';
  courseItem: any;
  constructor(
    public authService: AuthService,
    private snackService: SnackbarService,
    private router: Router,
    private _bottomSheetRef: MatBottomSheetRef<SetDesignationBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
  ) {
    console.log('SetDesignationBottomSheetComponent received', data);
    this.courseItem = data;
  }

  //remove duplicate
  doSetUserDesignation() {
    this.loading = true;
    console.log('SelectCourse @onSubscribe', this.courseItem);
    if (this.authService.currentUserValue) {
      const authData = this.authService.currentUserValue;
      const postData = {
        jobRoleId: this.courseItem?.id,
      };
      if (this.courseItem && this.authService.currentUserValue.id) {
        this.loadingTxt = 'Enrolling as ' + this.courseItem.title;
        let setDesignation = this.authService.enrollInJobRole(
          authData.token,
          postData,
        );
        setDesignation.subscribe((res) => {
          if (res) {
            if (!res.error && res.data) {
              const currentRoles = Array.isArray(
                this.authService.currentUserValue?.userJobRoles,
              )
                ? this.authService.currentUserValue.userJobRoles
                : [];
              const hasSelectedRole = currentRoles.some(
                (role: any) => role?.jobRoleId === this.courseItem?.id,
              );
              const updatedRoles = hasSelectedRole
                ? currentRoles
                : [
                    ...currentRoles,
                    {
                      userId: this.authService.currentUserValue.id,
                      jobRoleId: this.courseItem?.id,
                      jobRoleTitle: this.courseItem?.title,
                      createdAt: new Date().toISOString(),
                    },
                  ];

              const updatedUser = {
                ...this.authService.currentUserValue, // spread old fields
                designation: res.data?.designation,
                userJobRoles: updatedRoles,
              };
              this.authService.setUserJobRoles(updatedRoles);
              this.authService.setLocalData(updatedUser);

              setTimeout(() => {
                this.loading = false;
                this._bottomSheetRef.dismiss(null);
                // this.router.navigate(['/dashboard', this.courseItem?.slug]).then(() => {
                //   this.snackService.display('snackbar-dark', 'Welcome as a ' + this.courseItem?.title, 'bottom', 'center');
                // });
                this.router.navigate(['/dashboard']).then(() => {
                  this.snackService.display(
                    'snackbar-dark',
                    'Welcome as a ' + this.courseItem?.title,
                    'bottom',
                    'center',
                  );
                });
              }, 3000);
              //Route to new course dashboard
              //this.router.navigate(['/dashboard/start', this.courseItem?.slug]);
            } else {
              console.log('Error Enrolling Course');
              this.loading = false;
              this._bottomSheetRef.dismiss(null);
              this.snackService.display(
                'snackbar-dark',
                'Error Enrolling Course!',
                'bottom',
                'center',
              );
            }
          }
        });
      } else {
        this.loading = false;
        this._bottomSheetRef.dismiss(null);
        this.snackService.display(
          'snackbar-dark',
          'Sign in to add your designation and get started.',
          'bottom',
          'center',
        );
        this.authService.redirectToLogin();
      }
      //alert("Here to call the Set Designation API. See this callback trigger in Course Dashboard. Is Requireed?");
      //this.snackService.display('snackbar-success',subject+' added to learning list!','bottom','center');
    }
  }

  dismiss(event: MouseEvent): void {
    this._bottomSheetRef.dismiss(null);
    event.preventDefault();
  }

  viewCourseDetails() {
    this._bottomSheetRef.dismiss(null);
    this.router.navigate(['/app/program', this.courseItem?.slug]).then(() => {
      console.log('Navigation completed!');
    });
  }
}
