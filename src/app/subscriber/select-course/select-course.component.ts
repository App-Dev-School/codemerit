import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
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

  constructor(private router: Router, private master: MasterService) {
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
    console.log("SelectSubject @onCourseChange", subject);
    this.router.navigate(['/dashboard/learn', this.subject]).then(() => {
      console.log('Navigation completed!');
    });
  }

  onSubscribe(subject: string) {
    console.log("SelectSubject @onSubscribe", subject);
    //this.snackService.display('snackbar-success',subject+' added to learning list!','bottom','center');
  }

}
