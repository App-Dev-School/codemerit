import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService } from '@core';
import { MasterService } from '@core/service/master.service';
import { slideInOutAnimation } from '@shared/animations';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';

@Component({
  selector: 'app-select-course',
  templateUrl: './select-course.component.html',
  styleUrls: ['./select-course.component.scss'],
  animations: [slideInOutAnimation],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CoursePickerComponent
  ]
})
export class SelectCourseComponent implements OnInit {
  showContent = true;
  subject = "";
  subjectData: any;
  loading = false;
  loadingTxt = "";

  constructor(private router: Router, private authService: AuthService) {
    // constructor code
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Animation trigger can be based on route change
        this.showContent = false; // Hide content when navigation starts
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        // Ensure content is shown when navigation is complete
        this.showContent = true;
      }
    });
  }

  onCourseChange(subject: string) {
    this.subject = subject ? subject : "";
    console.log("CoursePickTest #2", subject);
    this.router.navigate(['/dashboard/start', this.subject]).then(() => {
      console.log('Navigation completed!');
    });
  }

  onSubscribe(subject: any) {
    this.loading = true;
    console.log("CoursePickTest @onSubscribe", subject);
    if (this.authService.currentUserValue) {
      const authData = this.authService.currentUserValue;
      const postData = {
        designation: subject?.id
      }
      if (subject && this.authService.currentUserValue.id) {
        this.loadingTxt = "Enrollment In Progress";
        let setDesignation = this.authService.updateUserAccount(authData.token, authData.id, postData);
        setDesignation.subscribe((res) => {
          this.loading = false;
          if (res) {
            if (!res.error && res.data) {
              this.onCourseChange(subject.title);
            } else {
              console.log("Error Enrolling Course");
            }
          }
        });
      } else {
        this.authService.redirectToLogin();
      }
      //alert("Here to call the Set Designation API. See this callback trigger in Course Dashboard. Is Requireed?");
      //this.snackService.display('snackbar-success',subject+' added to learning list!','bottom','center');
    }
  }
}
