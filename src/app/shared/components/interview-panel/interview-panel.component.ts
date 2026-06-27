import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-interview-panel',
  imports: [],
  templateUrl: './interview-panel.component.html',
  styleUrl: './interview-panel.component.css'
})
export class InterviewPanelComponent {

  @Output() submitted = new EventEmitter<string>();

  submitAndExit() {
    console.log("submitAndExit called with jjj:");
    this.submitted.emit("done");
  }
}
