
import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

interface MeritList {
  id: number;
  name: string;
  designationName?: string;
  username: string;
  image?: string;
  rank?: number;
  score: number;
  avgAccuracy?: number;
  totalAttempt?: number;
  totalCorrect?: number;
}

@Component({
    selector: 'app-merit-list-widget',
    imports: [NgClass],
    templateUrl: './merit-list-widget.component.html',
    styleUrl: './merit-list-widget.component.scss'
})
export class MeritListWidgetComponent {
  @Input() meritList: MeritList[] = [];
}
