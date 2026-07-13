import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '@core/service/auth.service';
import { HttpService } from '@core/service/http.service';
import { InterviewSubmitPayload, InterviewSubmitResponse } from '@core/models/interview';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {

  constructor(private httpService: HttpService, private authService: AuthService) { }

  submitInterview(payload: InterviewSubmitPayload): Observable<InterviewSubmitResponse> {
    const apiKey = this.authService.currentUserValue?.token ?? '';
    const url = 'apis/interviews/submit';
    return this.httpService.postData<InterviewSubmitResponse>(url, payload, apiKey);
  }
}
