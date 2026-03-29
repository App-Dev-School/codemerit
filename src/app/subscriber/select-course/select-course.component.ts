import { Component, OnInit, Input } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService } from '@core';
import { topToBottomAnimation } from '@shared/animations';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { SetDesignationBottomSheetComponent } from '../course-dashboard/confirm-course-enroll.component';

@Component({
  selector: 'app-select-course',
  templateUrl: './select-course.component.html',
  styleUrls: ['./select-course.component.scss'],
  animations: [topToBottomAnimation],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CoursePickerComponent
  ]
})
export class SelectCourseComponent implements OnInit {
  @Input() actionMode: 'enroll' | 'skill-rating' = 'enroll';
  showContent = true;
  subject = "";
  subjectData: any;
  loading = false;
  loadingTxt = "";
  userJobRoles: number[] = [];

  constructor(private router: Router, 
    private _bottomSheet: MatBottomSheet,
    public authService: AuthService) {
    // constructor code
    this.actionMode = 'skill-rating';
  }

  ngOnInit() {
    const roles = this.authService.getUserJobRoles();
    this.userJobRoles = Array.isArray(roles) ? roles.map(r => r.jobRoleId) : [];
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
    if (this.actionMode === 'enroll') {
      this.router.navigate(['/dashboard/start', this.subject]).then(() => {
        console.log('Navigation completed!');
      });
    } else if (this.actionMode === 'skill-rating') {
      this.router.navigate(['/assessment/skill-rating', this.subject]).then(() => {
        console.log('Navigated to skill-rating!');
      });
    }
  }

  onSubscribe(subject: any) {
    if (this.actionMode === 'enroll') {
      //take a confirmation
      this._bottomSheet.open(SetDesignationBottomSheetComponent, {
        data: subject
      });
      //this.doSetUserDesignation(subject);
    } else if (this.actionMode === 'skill-rating') {
      // Directly navigate to skill-rating for the selected course
      this.router.navigate(['/assessment/skill-rating', subject?.slug || subject]).then(() => {
        console.log('Navigated to skill-rating!');
      });
    }
  }
}
