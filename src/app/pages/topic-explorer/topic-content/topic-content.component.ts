import { Component, Input } from '@angular/core';
import { IonFab, IonFabButton, IonicModule, IonIcon, ModalController } from '@ionic/angular';
@Component({
    selector: 'app-topic-content',
    templateUrl: './topic-content.component.html',
    styleUrls: ['./topic-content.component.scss'],
    imports: [IonicModule],
})
export class TopicContentComponent {
  showButtons = false;
  @Input() title: string;
  @Input() content: string;
  constructor(private modalController: ModalController) {
    // constructor code
  }

  closeModal() {
    this.modalController.dismiss();
  }

  onScroll(event: any) {
    console.log("scolling...");
    
    const scrollPosition = event.detail.scrollTop;
    const scrollHeight = event.target.scrollHeight;
    const clientHeight = event.target.clientHeight;

    // Check if the user has scrolled to the bottom of the content
    if (scrollPosition + clientHeight >= scrollHeight) {
      this.showButtons = true; // Show buttons when scrolled to bottom
    } else {
      this.showButtons = false; // Hide buttons when not at the bottom
    }
  }
}
