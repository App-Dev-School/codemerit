import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Merits {
  knowledge: string;
  understanding: number;
  approach: string;
  skills: string;
  codability: string;
  challenges: string;
  status?: string;
}

interface MeritIndicators {
  label: string;
  class: string;
  labelClass: string;
  percentage: number;
}

@Component({
    selector: 'app-subject-performance-card',
    imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
    templateUrl: './subject-performance-card.component.html',
    styleUrl: './subject-performance-card.component.scss'
})
export class SubjectPerformanceCardComponent {
  //@Input() subject: string = "";
  @Input() subject: any;
  @Input() indicators: MeritIndicators[] = [];

  goToSubjects(){
    
  }
}
