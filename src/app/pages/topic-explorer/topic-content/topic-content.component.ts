import { Component, Input } from '@angular/core';
@Component({
    selector: 'app-topic-content',
    templateUrl: './topic-content.component.html',
    styleUrls: ['./topic-content.component.scss'],
    imports: [],
})
export class TopicContentComponent {
  showButtons = false;
  @Input() title: string;
  @Input() content: string;
  constructor() {
    // constructor code
  }

  closeModal() {
    
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
