import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-social-callback',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './social-callback.component.html',
  styleUrl: './social-callback.component.scss',
})
export class SocialCallbackComponent implements OnInit {
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');
    const error = this.route.snapshot.queryParamMap.get('error');

    if (error) {
      this.notifyOpener({
        type: 'SOCIAL_AUTH_CALLBACK',
        provider: 'linkedin',
        status: 'failed',
        error,
      });
      this.fail('LinkedIn sign-in was cancelled or failed. Please close this window and try again.');
      return;
    }

    if (!code) {
      this.notifyOpener({
        type: 'SOCIAL_AUTH_CALLBACK',
        provider: 'linkedin',
        status: 'failed',
        error: 'missing_code',
      });
      this.fail('Missing LinkedIn authorization code. Please close this window and try again.');
      return;
    }

    this.notifyOpener({
      type: 'SOCIAL_AUTH_CALLBACK',
      provider: 'linkedin',
      status: 'success',
      code,
      state,
    });
    window.close();
    this.loading = false;
  }

  private fail(message: string) {
    this.loading = false;
    this.error = message;
    window.close();
  }

  private notifyOpener(message: Record<string, unknown>) {
    if (!window.opener) {
      return;
    }
    window.opener.postMessage(message, window.location.origin);
  }
}
