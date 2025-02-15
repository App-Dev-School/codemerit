import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { TopicContentComponent } from '../topic-content/topic-content.component';
import { slideInOutAnimation } from '@shared/animations';
import { NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ConfigService } from '@config';
@Component({
    selector: 'app-topic-explorer',
    templateUrl: './topic-explorer.component.html',
    styleUrls: ['./topic-explorer.component.scss'],
    animations: [slideInOutAnimation],
    imports: [IonicModule]
})
export class TopicExplorerComponent implements OnInit, OnDestroy {
  showContent = true;
  topicResources: any;
  constructor(private router: Router, private config: ConfigService, private modalController: ModalController) {
    // constructor code
  }

  ngOnInit() {
    //Master Animation using Angular Routes
        this.router.events.subscribe(event => {
          if (event instanceof NavigationStart) {
            // Animation trigger can be based on route change
            this.showContent = false; // Hide content when navigation starts
          }
          if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
            // Ensure content is shown when navigation is complete
            this.showContent = true;
            console.log("TopicExplorer ngOnInit conig ", this.config.configData);
            //this.config.setConfigData(this.config.getSubjectConfig());
            //this.config.setHeaderConfig(this.config.getSubjectConfig());
            //console.log("TopicExplorer ngOnInit conig modified =>", this.config.configData);
          }
        });
      }

  async openTopicContent(slug:string) {
    const modal = await this.modalController.create({
      component: TopicContentComponent,
      cssClass: 'full-screen-modal',
      backdropDismiss: false,
      componentProps: {
        title: 'Full Screen Modal',
        content: slug
      }
    });
    return await modal.present();
  }

ngOnDestroy(): void {
  //Implement this
  // this.config.setHeaderConfig(this.config.getDefaultConfig());
  // alert("Header defaulted");
}
}
