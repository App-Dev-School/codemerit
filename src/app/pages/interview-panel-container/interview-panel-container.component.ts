import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Inject, Output } from '@angular/core';
import { InterviewPanelComponent } from '../../shared/components/interview-panel/interview-panel.component';
import { Router } from '@angular/router';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { AuthService } from '@core/service/auth.service';
@Component({
  selector: 'app-interview-panel-container',
  imports: [
    CommonModule,
    InterviewPanelComponent
  ],
  templateUrl: './interview-panel-container.component.html',
  styleUrl: './interview-panel-container.component.css'
})
export class InterviewPanelContainerComponent implements AfterViewInit {

  public isReady = false;
  public loaderProgress = 40;

    constructor(private router: Router,
    private master: MasterService,
    private snackService: SnackbarService,
    public authService: AuthService) {
    console.log("Welcome to Interview Studio v1.1");
    
    }
  ngAfterViewInit(): void {
    this.isReady = true;
  }

  onInterviewSubmitted(course: any) {
    console.log("submitAndExit called with course:", course);
    // this.subjectSelected.emit(course.slug);
    // if (this.mode === 'dialog' && this.dialogRef) {
    // this.dialogRef.close(course.slug);
    // }
    this.router.navigate(['/dashboard/learn']).then(() => {
        console.log('Navigation completed!');
      });
  }
}
