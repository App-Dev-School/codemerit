import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Inject, Output } from '@angular/core';
import { InterviewPanelComponent } from '../../shared/components/interview-panel/interview-panel.component';
import { Router } from '@angular/router';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { AuthService } from '@core/service/auth.service';
import { initLandingScripts } from './interview-panel.scripts';
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
  async ngAfterViewInit(): Promise<void> {
    await this.initInterviewPanel();
  }

  private async initInterviewPanel(): Promise<void> {
    this.startProgress();
    try {
      //await this.loadLandingFonts();
      await this.loadTailwind();
      //await this.loadLucide();
      initLandingScripts();
    } catch (error) {
      console.error('Landing asset initialization failed:', error);
    } finally {
      this.finishProgress();
      this.isReady = true;
    }
  }

  private startProgress(): void {
    this.loaderProgress = 40;
  }

  private finishProgress(): void {
    this.loaderProgress = 100;
  }

  private async loadTailwind(): Promise<void> {
    if (document.getElementById('landing-tailwind-script')) {
      return;
    }
    if (!document.getElementById('landing-tailwind-config')) {
      const configScript = document.createElement('script');
      configScript.id = 'landing-tailwind-config';
      configScript.text = `window.tailwind = window.tailwind || {}; window.tailwind.config = { darkMode: 'class', theme: { extend: { colors: { cyber: { midnight: '#0b0f19', cardDark: '#111827', neonBlue: '#38bdf8', neonPurple: '#a855f7', neonGreen: '#22c55e', accent: '#f43f5e' } }, fontFamily: { mono: ['Fira Code', 'Courier New', 'monospace'], sans: ['Plus Jakarta Sans', 'sans-serif'] } } } } };`;
      document.head.appendChild(configScript);
    }
    await this.loadScript('https://cdn.tailwindcss.com', 'landing-tailwind-script');
  }

  private loadScript(src: string, id: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const existing = document.getElementById(id) as HTMLScriptElement | null;
      if (existing) {
        if (existing.getAttribute('data-loaded') === 'true') {
          resolve();
        } else {
          existing.addEventListener('load', () => resolve(), { once: true });
          existing.addEventListener('error', () => resolve(), { once: true });
        }
        return;
      }
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = true;
      script.onload = () => {
        script.setAttribute('data-loaded', 'true');
        resolve();
      };
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });
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
