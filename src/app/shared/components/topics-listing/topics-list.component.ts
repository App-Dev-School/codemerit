import { AsyncPipe, NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle, MatCardTitleGroup } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { TopicExplorerComponent } from 'src/app/pages/topic-explorer/topic-explorer/topic-explorer.component';
@Component({
  selector: 'app-topics-list',
  imports: [
    NgClass,
    AsyncPipe,
    MatCard,
    MatCardHeader, MatCardContent,
    MatCardSubtitle,
    MatTooltipModule,
    MatCardActions,
    MatButtonModule,
    MatChipsModule,
    MatRippleModule,
    MatIconModule
  ],
  templateUrl: './topics-list.component.html',
  styleUrl: './topics-list.component.scss'
})
export class TopicsListComponent {
  @Input() subjectTopics: Observable<any[]>;

  constructor(public router: Router, public modalController: ModalController) {

  }

  //unused
  async openTopicContent(slug:string) {
    const modal = await this.modalController.create({
      component: TopicExplorerComponent,
      cssClass: 'full-screen-modal',
      backdropDismiss: false,
      componentProps: {
        title: 'Full Screen Modal',
        content: slug
      }
    });
    return await modal.present();
  }

  async launchTopicExplorer(slug:string) {
    this.router.navigate(["topics/explore/rxjs"]);
  }
}
