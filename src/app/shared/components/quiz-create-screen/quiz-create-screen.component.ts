// chart-card4.component.ts
import { AsyncPipe, NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@core';
import { MasterService } from '@core/service/master.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-quiz-create-screen',
  imports: [
    AsyncPipe,
    NgClass,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
    MatRippleModule,
    MatIconModule
  ],
  templateUrl: './quiz-create-screen.component.html',
  styleUrls: ['./quiz-create-screen.component.scss']
})
export class QuizCreateScreenComponent implements OnInit, AfterViewInit, OnDestroy  {
  @ViewChild('matrixCanvas', { static: true }) matrixCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() user = User;
  @Input() payload: any;
  isLoading = true;
  mode: 'dialog' | 'route' = 'route';
  userId?: string;
 
   messages : string[] = [
    "🧠 Generating Challenges…",
    "⚡Analyzing Difficulty…",
    "🚀 Setting up your Brain Workout…",
    "📚 Loading Quiz…"
  ];
  messageIndex = 0;
  finished = false;
  currentMessage = this.messages[this.messageIndex];
  private messageInterval: any;
  private animationFrameId: number | null = null;

  ngOnInit() {
    this.cycleMessages();
  }

  ngAfterViewInit() {
    this.startMatrixRain();
  }

  ngOnDestroy() {
    if (this.messageInterval) clearInterval(this.messageInterval);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  startMatrixRain() {
    const canvas = this.matrixCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    const letters = ['0', '1'];
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // fading effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f0'; // green
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      this.animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    // Handle window resize
    window.addEventListener('resize', () => {
      canvas.height = window.innerHeight;
      canvas.width = window.innerWidth;
    });
  }

  cycleMessages() {
    const interval = setInterval(() => {
      this.messageIndex++;
      if (this.messageIndex < this.messages.length) {
        this.currentMessage = this.messages[this.messageIndex];
      } else {
        clearInterval(interval);
        this.finished = true; // ✅ Mark finished
        this.onFinish();      // ✅ Call action
      }
    }, 3000); // change text every 2s
  }

  onFinish() {
    // ✅ Your custom action here
    console.log('Quiz ready! Take action now.');
    // Example: navigate, show start button, etc.
    // this.router.navigate(['/quiz/start']);
  }

  constructor(private master: MasterService, private router: Router,
    private route: ActivatedRoute,
    //private _bottomSheet: MatBottomSheet,
    @Optional() public dialogRef?: MatDialogRef<QuizCreateScreenComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any) {
    if (this.dialogRef) {
      this.mode = 'dialog';
      this.userId = data?.id;
      console.log("CoursePicker Dialog Data ", data);

    } else {
      this.mode = 'route';
      this.route.paramMap.subscribe(params => {
        this.userId = params.get('id') ?? undefined;
      });
    }
  }

  startQuiz(course: any) {
    console.log("QuizCreateScreenComponent", course);
     if (this.mode === 'dialog' && this.dialogRef) {
      this.dialogRef.close(course.slug);
     }
  }

  close() {
    if (this.mode === 'dialog' && this.dialogRef) {
      this.dialogRef.close('Dialog Closed');
    } else {
      this.router.navigate(['/dashboard/start']);
    }
  }
}
