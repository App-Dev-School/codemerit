/* eslint-disable @typescript-eslint/no-empty-function */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular'; 
@Component({
    selector: 'app-page404',
    templateUrl: './page404.component.html',
    styleUrls: ['./page404.component.scss'],
    imports: [
        IonicModule,
        FormsModule,
        MatButtonModule,
        RouterLink,
    ]
})
export class Page404Component {
  constructor(private navCtrl: NavController) { }

  navigateToHome(){
    this.navCtrl.navigateRoot(['./dashboard']);
  }
}
