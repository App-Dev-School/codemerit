// chart-card4.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-chart-card4',
    imports: [MatCardModule, CommonModule],
    templateUrl: './chart-card4.component.html',
    styleUrls: ['./chart-card4.component.scss']
})
export class ChartCard4Component implements OnInit {
  @Input() maleCount: number = 0;
  @Input() femaleCount: number = 0;

  ngOnInit() {
    // Update chart data if inputs change
  }
}
