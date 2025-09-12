import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { MasterService } from '@core/service/master.service';
import { slideInOutAnimation } from '@shared/animations';
import { MySubjectsComponent } from '@shared/components/my-subjects/my-subjects.component';

@Component({
  selector: 'app-select-subject',
  templateUrl: './select-subject.component.html',
  styleUrls: ['./select-subject.component.scss'],
  animations: [slideInOutAnimation],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MySubjectsComponent
  ]
})
export class SelectSubjectComponent implements OnInit {
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

  onSubjectChange(subject: string) {
    this.subject = subject ? subject : "";
    console.log("SelectSubject @onSubjectChange", subject);
    this.router.navigate(['/dashboard/learn', this.subject]);
  }

  onSubscribe(subject: string) {
    alert("callpaihere");
    console.log("SelectSubject @onSubscribe", subject);
    //this.snackService.display('snackbar-success',subject+' added to learning list!','bottom','center');
  }

}
