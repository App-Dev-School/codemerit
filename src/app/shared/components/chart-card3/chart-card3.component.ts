import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-chart-card3',
    imports: [MatCardModule, MatIconModule],
    templateUrl: './chart-card3.component.html',
    styleUrl: './chart-card3.component.scss'
})
export class ChartCard3Component {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  constructor() {
    this.chart();
  }

  private chart() {
   
  }
}
