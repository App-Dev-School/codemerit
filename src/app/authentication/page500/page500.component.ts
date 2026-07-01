import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ParticleCanvasComponent } from '@shared/components/particle-canvas/particle-canvas.component';

@Component({
  selector: 'app-page500',
  standalone: true,
  imports: [RouterLink, ParticleCanvasComponent],
  templateUrl: './page500.component.html',
  styleUrls: ['./page500.component.scss'],
})
export class Page500Component {}
