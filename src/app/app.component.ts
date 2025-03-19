import { Component, OnInit } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router, RouterModule } from '@angular/router';
import { PageLoaderComponent } from './layout/page-loader/page-loader.component';
import { IonFab, IonFabButton, IonicModule, ModalController } from '@ionic/angular';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  //animations: [slideInOutAnimation],
  imports: [
    RouterModule,
    IonicModule,
    PageLoaderComponent
  ],
  //checkifrequired
  providers: [ModalController]
})
export class AppComponent implements OnInit{
  currentUrl!: string;
  isVisible = true;
  constructor(public _router: Router) {
    this._router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.currentUrl = routerEvent.url.substring(
          routerEvent.url.lastIndexOf('/') + 1
        );
      }
      if (routerEvent instanceof NavigationEnd) {
      }
      window.scrollTo(0, 0);
    });
  }

  //Added for animation in router outlet
  ngOnInit() {
    //Enable component transition globally
    // this._router.events.subscribe(event => {
    //   if (event instanceof NavigationStart) {
    //     this.isVisible = false; // Hide the current component
    //   }
    //   if (event instanceof NavigationEnd) {
    //     setTimeout(() => {
    //       this.isVisible = true; // Show the new component
    //     }, 300); // Adjust based on your animation duration
    //   }
    // });
  }

}
