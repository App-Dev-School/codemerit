import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ParticleCanvasComponent } from '@shared/components/particle-canvas/particle-canvas.component';

@Component({
  selector: 'app-page404',
  standalone: true,
  imports: [RouterLink, ParticleCanvasComponent],
  templateUrl: './page404.component.html',
  styleUrls: ['./page404.component.scss'],
})
export class Page404Component {}
