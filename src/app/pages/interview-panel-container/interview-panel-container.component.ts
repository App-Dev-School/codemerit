import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { InterviewPanelComponent } from '../../shared/components/interview-panel/interview-panel.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { AuthService } from '@core/service/auth.service';
import { InterviewService } from './interview.service';
import { InterviewStatus, InterviewSubmissionEvent, InterviewSubmitPayload } from '@core/models/interview';

@Component({
  selector: 'app-interview-panel-container',
  imports: [
    CommonModule,
    InterviewPanelComponent
  ],
  templateUrl: './interview-panel-container.component.html',
  styleUrl: './interview-panel-container.component.css'
})
export class InterviewPanelContainerComponent implements OnInit, AfterViewInit {

  public isReady = false;
  public loaderProgress = 40;
  public isSubmitting = false;

  private interviewId = 0;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private master: MasterService,
    private snackService: SnackbarService,
    private interviewService: InterviewService,
    public authService: AuthService) {
    console.log("Welcome to Interview Studio v1.1");

  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.interviewId = idParam ? Number(idParam) : 0;
  }

  ngAfterViewInit(): void {
    this.isReady = true;
  }

  onInterviewSubmitted(event: InterviewSubmissionEvent): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const payload: InterviewSubmitPayload = {
      ...event,
      interviewId: this.interviewId,
      browser: navigator.userAgent,
      source: 'interview-panel-web',
    };

    console.log('InterviewPanelContainer ### Final submit payload =>', payload);
    console.log('InterviewPanelContainer ### Final submit payload (JSON) =>', JSON.stringify(payload, null, 2));

    this.interviewService.submitInterview(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        console.log('InterviewPanelContainer ### submitInterview response =>', res);
        const message = event.status === InterviewStatus.Declined
          ? 'Interview marked as declined.'
          : 'Interview feedback submitted successfully.';
        this.snackService.display('snackbar-success', message, 'bottom', 'center');
        this.router.navigate(['/dashboard/learn']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('InterviewPanelContainer ### submitInterview error =>', error);
        const message = error?.error?.message || 'Failed to submit interview feedback. Please try again.';
        this.snackService.display('snackbar-danger', message, 'bottom', 'center');
      }
    });
  }
}
