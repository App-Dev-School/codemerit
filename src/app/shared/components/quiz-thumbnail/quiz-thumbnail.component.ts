import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';

interface SubjectVM {
  title: string;
  image: string;
  chipStyle: string;
  iconBgStyle: string;
}

@Component({
  selector: 'app-quiz-thumbnail',
  templateUrl: './quiz-thumbnail.component.html',
  styleUrls: ['./quiz-thumbnail.component.scss'],
  imports: [CommonModule, MatCardModule, MatButtonModule, FormsModule, MatIcon],
})
export class QuizThumbnailComponent implements OnInit {
  @Input() quiz: any;
  @Output() quizSelected = new EventEmitter<string>();
  @Output() viewAttempts = new EventEmitter<string>();

  /** Pre-computed once in ngOnInit — never re-evaluated on CD cycles */
  bannerBlobStyle = '';
  accentColor = '#6366f1';
  subjects: SubjectVM[] = [];

  ngOnInit(): void {
    const raw: any[] = this.quiz?.subjects || [];
    this.subjects = raw.slice(0, 5).map(s => ({
      title:       s.title  ?? '',
      image:       s.image  ?? '',
      chipStyle:   this.chipStyle(s),
      iconBgStyle: this.iconBgStyle(s),
    }));
    this.bannerBlobStyle = this.blobStyle(raw);
    this.accentColor     = raw.length ? this.resolveColor(raw[0]) : '#6366f1';
  }

  takeQuiz(slug: string)         { this.quizSelected.emit(slug); }
  viewResult(code: string)       { this.viewAttempts.emit(code); }

  // ── Private helpers (run once, not in template) ────────────────────────

  private valid(c: string | undefined | null): boolean {
    if (!c) return false;
    const t = c.trim().toLowerCase();
    return !!t && t !== '#fff' && t !== '#ffffff' && t !== 'white';
  }

  /** Returns the subject's color, or a hue derived from the title as fallback */
  private resolveColor(s: any): string {
    return this.valid(s?.color) ? s.color : this.hashHsl(s);
  }

  /** hex color → rgba(r,g,b,a) string */
  private rgba(hex: string, a: number): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /** Produces a stable hsl() string from subject title/id hash */
  private hashHsl(s: any): string {
    const str = String(s?.title || s?.id || '');
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return `hsl(${Math.abs(h) % 360},65%,48%)`;
  }

  /** Returns rgba or hsla depending on whether the subject has a valid hex color */
  private subjectRgba(s: any, a: number): string {
    return this.valid(s?.color)
      ? this.rgba(s.color, a)
      : this.hashHsl(s).replace(')', `,${a})`).replace('hsl(', 'hsla(');
  }

  private blobStyle(subjects: any[]): string {
    const base = 'position:absolute;inset:0;pointer-events:none;';
    if (!subjects.length) {
      return base +
        'background:' +
        'radial-gradient(ellipse 85% 110% at 20% 52%,rgba(99,102,241,.78) 0%,transparent 65%),' +
        'radial-gradient(ellipse 65% 85% at 82% 30%,rgba(139,92,246,.52) 0%,transparent 60%);';
    }
    const c1 = this.subjectRgba(subjects[0], 0.82);
    const c2 = this.subjectRgba(subjects[subjects.length > 1 ? 1 : 0], 0.52);
    return base +
      `background:` +
      `radial-gradient(ellipse 85% 110% at 18% 54%,${c1} 0%,transparent 64%),` +
      `radial-gradient(ellipse 65% 85% at 84% 28%,${c2} 0%,transparent 58%);`;
  }

  private chipStyle(s: any): string {
    const shared = 'display:inline-flex;align-items:center;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;white-space:nowrap;';
    if (this.valid(s?.color)) {
      return shared +
        `background:${this.rgba(s.color, 0.12)};` +
        `border:1px solid ${this.rgba(s.color, 0.3)};` +
        `color:${s.color};`;
    }
    return shared +
      'background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.22);color:#4338ca;';
  }

  private iconBgStyle(s: any): string {
    const shared = 'width:38px;height:38px;border-radius:10px;object-fit:contain;padding:5px;flex-shrink:0;backdrop-filter:blur(6px);';
    if (this.valid(s?.color)) {
      return shared +
        `background:${this.rgba(s.color, 0.22)};` +
        `border:1px solid ${this.rgba(s.color, 0.5)};` +
        `box-shadow:0 2px 10px ${this.rgba(s.color, 0.35)};`;
    }
    return shared +
      'background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.32);' +
      'box-shadow:0 2px 10px rgba(0,0,0,.25);';
  }
}
