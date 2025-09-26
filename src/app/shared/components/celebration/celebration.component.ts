import { Component, EventEmitter, Input, Output } from '@angular/core';

interface CelebrationItem {
  emoji: string;
  x: number;
  y: number;
  duration: number;
  size: number;
  drift : string;
}

@Component({
  selector: 'app-celebration',
  templateUrl: './celebration.component.html',
  styleUrls: ['./celebration.component.css']
})
export class CelebrationComponent {
  @Input() trigger: { x: number; y: number } | null = null;
  @Output() animationDone = new EventEmitter<void>();

  items: CelebrationItem[] = [];
  //private emojis = ['👏', '🎉', '🌟', '✨', '🎊', '🔥'];
  private emojis = ['👏', '🌟', '✨'];
  ngOnChanges() {
    if (this.trigger) {
      this.launch(this.trigger.x, this.trigger.y);
    }
  }

private launch(x: number, y: number) {
  this.items = [];

  for (let i = 0; i < 5; i++) {
    const drift = Math.random() * 100 - 50; // -50px to +50px drift
    this.items.push({
      //emoji: '👏',
      emoji: this.emojis[Math.floor(Math.random() * this.emojis.length)],
      x: x,
      y: y,
      duration: Math.random() * 1 + 2, // 3s–5s
      size: Math.random() * 15 + 40,   // larger (40–55px)
      drift: `${drift}px`
    });
  }

  setTimeout(() => {
      this.items = [];
      this.animationDone.emit(); // 👈 notify parent
    }, 2500);
}


}