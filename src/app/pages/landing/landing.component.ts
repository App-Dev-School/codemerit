import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingHeaderComponent } from '@shared/components/landing-header/landing-header.component';
import { ParticleCanvasComponent } from '@shared/components/particle-canvas/particle-canvas.component';
import { HeroComponent } from '@shared/components/hero/hero.component';
import { AssessmentDashboardComponent } from '@shared/components/assessment-dashboard/assessment-dashboard.component';
import { SchedulerComponent } from '@shared/components/scheduler/scheduler.component';
import { MarksheetComponent } from '@shared/components/marksheet/marksheet.component';
import { SandboxComponent } from '@shared/components/sandbox/sandbox.component';
import { QuizZoneComponent } from '@shared/components/quiz-zone/quiz-zone.component';
import { PlaygroundComponent } from '@shared/components/playground/playground.component';
import { LandingFooterComponent } from '@shared/components/landing-footer/landing-footer.component';
import { initLandingScripts } from './landing.page.scripts';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule,
    LandingHeaderComponent,
    ParticleCanvasComponent,
    HeroComponent,
    AssessmentDashboardComponent,
    SchedulerComponent,
    MarksheetComponent,
    SandboxComponent,
    QuizZoneComponent,
    PlaygroundComponent,
    LandingFooterComponent
  ],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements AfterViewInit {
  public isReady = false;
  public loaderProgress = 40;

  async ngAfterViewInit(): Promise<void> {
    await this.initLandingPage();
  }

  private async initLandingPage(): Promise<void> {
    this.startProgress();
    try {
      await this.loadLandingFonts();
      await this.loadTailwind();
      await this.loadLucide();
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

  private async loadLandingFonts(): Promise<void> {
    const linkId = 'landing-fonts';
    if (document.getElementById(linkId)) {
      return;
    }
    return new Promise<void>((resolve) => {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
      link.onload = () => resolve();
      link.onerror = () => resolve();
      document.head.appendChild(link);
    });
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

  private async loadLucide(): Promise<void> {
    await this.loadScript('https://unpkg.com/lucide@latest', 'landing-lucide-script');
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
}
