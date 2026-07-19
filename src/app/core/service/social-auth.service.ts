import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

declare global {
  interface Window {
    google?: any;
  }
}

const LINKEDIN_STATE_KEY = 'socialAuth.linkedinState';

export type LinkedinStartResult = 'opened' | 'not-configured' | 'popup-blocked';

@Injectable({ providedIn: 'root' })
export class SocialAuthService {

  private linkedInPopup: Window | null = null;
  private popupPollHandle: ReturnType<typeof setInterval> | null = null;
  private messageHandler: ((event: MessageEvent) => void) | null = null;

  get linkedinRedirectUri(): string {
    return `${window.location.origin}/authentication/social-callback`;
  }

  /**
   * Loads the Google Identity SDK (if needed) and shows the One Tap / account
   * chooser prompt. `onNotShown` fires when Google silently skips the prompt
   * (e.g. third-party cookies blocked, or the user dismissed it recently).
   */
  promptGoogleLogin(onCredential: (idToken: string) => void, onNotShown: () => void): Promise<void> {
    const clientId = environment.socialAuth?.googleClientId;
    if (!clientId) {
      return Promise.reject(new Error('Google login is not configured yet.'));
    }

    return this.loadGoogleSdk().then(() => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => onCredential(response?.credential),
      });
      window.google.accounts.id.prompt((notification: any) => {
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
          onNotShown();
        }
      });
    });
  }

  private loadGoogleSdk(): Promise<void> {
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }

  /**
   * Opens the LinkedIn OAuth popup and wires up the postMessage handshake
   * with the `/authentication/social-callback` page.
   *
   * `onCode` fires once with the verified auth code.
   * `onCancelled` fires with a message when LinkedIn reports a failure or the
   * returned `state` doesn't match what we sent (possible CSRF), and with
   * `undefined` when the user simply closes the popup without finishing.
   */
  startLinkedinLogin(onCode: (code: string) => void, onCancelled: (message?: string) => void): LinkedinStartResult {
    const clientId = environment.socialAuth?.linkedinClientId;
    if (!clientId) {
      return 'not-configured';
    }

    this.stopWatchingPopup();

    const redirectUri = this.linkedinRedirectUri;
    const state = this.createState();
    sessionStorage.setItem(LINKEDIN_STATE_KEY, state);

    const scope = encodeURIComponent(environment.socialAuth?.linkedinScope || 'openid profile email');
    const params = [
      `response_type=code`,
      `client_id=${encodeURIComponent(clientId)}`,
      `redirect_uri=${encodeURIComponent(redirectUri)}`,
      `state=${encodeURIComponent(state)}`,
      `scope=${scope}`,
    ].join('&');
    const url = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
    const width = 560;
    const height = 680;
    const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
    const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);

    this.linkedInPopup = window.open(
      url,
      'linkedin-login',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!this.linkedInPopup) {
      sessionStorage.removeItem(LINKEDIN_STATE_KEY);
      return 'popup-blocked';
    }

    let resolved = false;
    const popupRef = this.linkedInPopup;

    this.messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== 'SOCIAL_AUTH_CALLBACK') {
        return;
      }
      if (event.source && event.source !== popupRef) {
        return;
      }

      resolved = true;
      const expectedState = sessionStorage.getItem(LINKEDIN_STATE_KEY);
      sessionStorage.removeItem(LINKEDIN_STATE_KEY);
      this.stopWatchingPopup();

      if (event.data.status !== 'success' || !event.data.code) {
        onCancelled('LinkedIn sign-in was cancelled or failed.');
        return;
      }
      if (!expectedState || event.data.state !== expectedState) {
        onCancelled('Unable to verify LinkedIn sign-in. Please try again.');
        return;
      }
      onCode(event.data.code);
    };
    window.addEventListener('message', this.messageHandler);

    this.popupPollHandle = setInterval(() => {
      if (!resolved && popupRef.closed) {
        this.stopWatchingPopup();
        onCancelled(undefined);
      }
    }, 500);

    return 'opened';
  }

  private stopWatchingPopup() {
    if (this.popupPollHandle) {
      clearInterval(this.popupPollHandle);
      this.popupPollHandle = null;
    }
    if (this.messageHandler) {
      window.removeEventListener('message', this.messageHandler);
      this.messageHandler = null;
    }
    this.linkedInPopup = null;
  }

  private createState(): string {
    const values = new Uint32Array(4);
    window.crypto.getRandomValues(values);
    return Array.from(values).map((value) => value.toString(16)).join('');
  }
}
