import { Component, Input, OnInit } from '@angular/core';
//import * as Prism from 'prismjs';
//import 'prismjs/themes/prism.css'; // Default theme
//import 'prismjs/components/prism-typescript.min.js'; // Import TypeScript language support
@Component({
    selector: 'app-code-snippet',
    imports: [
    ],
    templateUrl: './code-snippet.component.html',
    styleUrl: './code-snippet.component.scss'
})
export class CodeSnippetComponent implements OnInit{
  @Input() code: string = 'console.log("Welcome to CodeMerit")';  // This will hold the code snippet to display
  @Input() language: string = 'typescript';  // Default language is TypeScript

  constructor() { }

  ngOnInit(): void {
    // After initialization, we manually highlight the code using Prism
    // setTimeout(() => {
    //   Prism.highlightAll();
    // }, 0);
  }

}
