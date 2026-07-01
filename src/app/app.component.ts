import { Component, OnInit, Renderer2, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Event, NavigationEnd, NavigationStart, Router, RouterModule } from '@angular/router';
import { PageLoaderComponent } from './layout/page-loader/page-loader.component';
import { MasterService } from '@core/service/master.service';
import { AuthConstants } from '@config/AuthConstants';
import { ThemeService } from '@core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  //animations: [slideInOutAnimation],
  imports: [
    RouterModule,
    PageLoaderComponent
  ]
})
export class AppComponent implements OnInit{
  currentUrl!: string;

  private themeService = inject(ThemeService);
  private renderer    = inject(Renderer2);
  private document    = inject<Document>(DOCUMENT);

  constructor(public _router: Router, private master : MasterService) {
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
    // Apply saved theme preference globally — runs for every route including
    // standalone ones like /interview-panel that have no MainLayoutComponent.
    this.themeService.init(this.document, this.renderer);
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

    // const jobMap = this.master.getJobRoleMap();
    // console.log("MasterDataFlow checking jobMap EXISTS", jobMap);
    // //jobMap
    // if(true){
    // console.log("MasterDataFlow FETCHING NEW jobMap");
    // this.master.fetchJobRoleSubjectMapping();
    // }else{
    //   console.log("MasterDataFlow jobMap EXISTS", jobMap);
    // }
  }

}