import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QuizHelperService {

  private sounds: { [key: string]: HTMLAudioElement } = {};

  constructor() {
    // preload common quiz sounds
    this.loadSound('click', 'assets/audio/click.wav');
    this.loadSound('right', 'assets/audio/right.wav');
    this.loadSound('incorrect', 'assets/audio/incorrect.wav');
    this.loadSound('well_done', 'assets/audio/well_done.wav');
    this.loadSound('clap', 'assets/audio/clap.wav');
    this.loadSound('you-are-right', 'assets/audio/you-are-right.mp3');
    this.loadSound('right_answer', 'assets/audio/right_answer.mp3');
    this.loadSound('wrong_answer', 'assets/audio/wrong_answer.mp3');
    //quiz result
    this.loadSound('excellent', 'assets/audio/excellent.mp3');
    this.loadSound('test_failed', 'assets/audio/test_failed.mp3');
    this.loadSound('low_accuracy', 'assets/audio/low_accuracy.mp3');
  }

  /** ---------- SOUND HELPERS ---------- **/

  private loadSound(key: string, path: string): void {
    const audio = new Audio(path);
    audio.load();
    this.sounds[key] = audio;
  }

  playSound(key: string): void {
    const sound = this.sounds[key];
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    } else {
      console.warn(`Sound "${key}" not found!`);
    }
  }

  /** ---------- QUIZ HELPERS ---------- **/

  // Shuffle an array (Fisher–Yates algorithm)
  shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length;
    let randomIndex: number;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]
      ];
    }
    return array;
  }

  // Calculate percentage score
  calculateScore(correctAnswers: number, totalQuestions: number): number {
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
  }

  // Format time (mm:ss) for quiz timer
  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}