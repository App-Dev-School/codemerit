import { NgClass, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { QuestionItem } from 'src/app/admin/questions/manage/question-item.model';

@Component({
  selector: 'app-selected-option-detail',
  imports: [
    NgClass,
    NgSwitch, NgSwitchCase, NgSwitchDefault,
    MatIcon,
    MatButton,
    MatProgressBar
  ],
  templateUrl: './selected-option-detail.component.html',
  styleUrl: './selected-option-detail.component.scss'
})
export class SelectedOptionDetailComponent {
  progress = 100;
  private intervalId: any;
  private duration = 25; // seconds
  private step = 100 / (this.duration * 10); // update every 100ms
  rewardMessageIndex: number = 0;

  constructor(
    public dialogRef: MatDialogRef<SelectedOptionDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      isCorrect: boolean;
      message: string;
      icon: string;
      question?: QuestionItem;
    }
  ) {}

  ngOnInit(): void {
    this.startProgressBar();
    // Pick a random reward message index (0-4) for correct answers
    if (this.data.isCorrect) {
      this.rewardMessageIndex = Math.floor(Math.random() * 5);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startProgressBar(): void {
    let ticks = this.duration * 10;
    this.progress = 100;
    this.intervalId = setInterval(() => {
      ticks--;
      this.progress -= this.step;
      if (ticks <= 0) {
        this.progress = 0;
        clearInterval(this.intervalId);
        this.dialogRef.close('auto-next');
      }
    }, 100);
  }

  onNext(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.dialogRef.close('next');
  }
}
