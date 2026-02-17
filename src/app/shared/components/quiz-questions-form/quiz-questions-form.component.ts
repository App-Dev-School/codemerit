import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule, MatListOption, MatSelectionList } from '@angular/material/list';
import {
  CdkDragDrop,
  moveItemInArray,
  CdkDropList,
  CdkDrag,
  CdkDragHandle,
  CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgScrollbar } from 'ngx-scrollbar';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardModule } from '@angular/material/card';
import { NgTemplateOutlet } from '@angular/common';


interface Question {
  id: number;
  title: string;
  subject: string; // name
  topic: string;   // name
  subjectId?: number;
  topicId?: number;
  level: string;
}

@Component({
  selector: 'app-quiz-questions-form',
  templateUrl: './quiz-questions-form.component.html',
  styleUrls: ['./quiz-questions-form.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgTemplateOutlet,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIcon,
    MatSelectModule,
    MatSelectionList,
    MatCheckboxModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    NgScrollbar
  ]
})
export class QuizQuestionsFormComponent implements OnInit {
  filterForm: FormGroup;
  subjects = [
    { id: 1, name: 'HTML' },
    { id: 2, name: 'CSS' },
    { id: 3, name: 'JavaScript' },
    { id: 4, name: 'Node.js' },
    { id: 5, name: 'Python' },
    { id: 6, name: 'Angular' },
    { id: 7, name: 'React' }
  ];
  topics = [
    { id: 1, name: 'Elements', subjectId: 1 },
    { id: 2, name: 'Selectors', subjectId: 2 },
    { id: 3, name: 'Flexbox', subjectId: 2 },
    { id: 4, name: 'ES6', subjectId: 3 },
    { id: 5, name: 'Async', subjectId: 3 },
    { id: 6, name: 'Modules', subjectId: 4 },
    { id: 7, name: 'Express', subjectId: 4 },
    { id: 8, name: 'Functions', subjectId: 5 },
    { id: 9, name: 'OOP', subjectId: 5 },
    { id: 10, name: 'Components', subjectId: 6 },
    { id: 11, name: 'Services', subjectId: 6 },
    { id: 12, name: 'Hooks', subjectId: 7 },
    { id: 13, name: 'State', subjectId: 7 }
  ];
  questions: Question[] = [
    { id: 1, title: 'What does <div> represent in HTML?', subject: 'HTML', topic: 'Elements', subjectId: 1, topicId: 1, level: 'Easy' },
    { id: 2, title: 'How do you select an element by class in CSS?', subject: 'CSS', topic: 'Selectors', subjectId: 2, topicId: 2, level: 'Easy' },
    { id: 3, title: 'What is Flexbox used for?', subject: 'CSS', topic: 'Flexbox', subjectId: 2, topicId: 3, level: 'Intermediate' },
    { id: 4, title: 'What is a let declaration in ES6?', subject: 'JavaScript', topic: 'ES6', subjectId: 3, topicId: 4, level: 'Easy' },
    { id: 5, title: 'Explain Promises in JavaScript.', subject: 'JavaScript', topic: 'Async', subjectId: 3, topicId: 5, level: 'Intermediate' },
    { id: 6, title: 'How do you export a module in Node.js?', subject: 'Node.js', topic: 'Modules', subjectId: 4, topicId: 6, level: 'Easy' },
    { id: 7, title: 'What is Express used for?', subject: 'Node.js', topic: 'Express', subjectId: 4, topicId: 7, level: 'Easy' },
    { id: 8, title: 'How do you define a function in Python?', subject: 'Python', topic: 'Functions', subjectId: 5, topicId: 8, level: 'Easy' },
    { id: 9, title: 'What is a class in Python?', subject: 'Python', topic: 'OOP', subjectId: 5, topicId: 9, level: 'Intermediate' },
    { id: 10, title: 'What is a component in Angular?', subject: 'Angular', topic: 'Components', subjectId: 6, topicId: 10, level: 'Easy' },
    { id: 11, title: 'What is a service in Angular?', subject: 'Angular', topic: 'Services', subjectId: 6, topicId: 11, level: 'Intermediate' },
    { id: 12, title: 'What are React Hooks?', subject: 'React', topic: 'Hooks', subjectId: 7, topicId: 12, level: 'Intermediate' },
    { id: 13, title: 'How do you manage state in React?', subject: 'React', topic: 'State', subjectId: 7, topicId: 13, level: 'Intermediate' },
    { id: 14, title: 'What is the purpose of <span> in HTML?', subject: 'HTML', topic: 'Elements', subjectId: 1, topicId: 1, level: 'Easy' },
    { id: 15, title: 'How do you center a div using Flexbox?', subject: 'CSS', topic: 'Flexbox', subjectId: 2, topicId: 3, level: 'Intermediate' },
    { id: 16, title: 'What is the difference between var, let, and const?', subject: 'JavaScript', topic: 'ES6', subjectId: 3, topicId: 4, level: 'Intermediate' },
    { id: 17, title: 'How do you handle async code in Node.js?', subject: 'Node.js', topic: 'Modules', subjectId: 4, topicId: 6, level: 'Intermediate' },
    { id: 18, title: 'What is inheritance in Python OOP?', subject: 'Python', topic: 'OOP', subjectId: 5, topicId: 9, level: 'Advanced' },
    { id: 19, title: 'How do you create a new Angular service?', subject: 'Angular', topic: 'Services', subjectId: 6, topicId: 11, level: 'Intermediate' },
    { id: 20, title: 'What is useEffect in React?', subject: 'React', topic: 'Hooks', subjectId: 7, topicId: 12, level: 'Intermediate' }
  ];
  filteredQuestions: Question[] = [];
  selectedQuestionsControl = new FormControl<Question[]>([]);
  quizQuestions: Question[] = [];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      subject: [[]],
      topic: [[]],
      level: ['']
    });
  }

  ngOnInit(): void {
    this.filteredQuestions = this.questions;
  }

  applyFilters() {
    const { subject, topic, level } = this.filterForm.value;
    this.filteredQuestions = this.questions.filter(q => {
      // Always treat subject/topic as arrays
      const subjectMatch = !subject?.length || (q.subjectId !== undefined && q.subjectId !== null && subject.includes(q.subjectId));
      const topicMatch = !topic?.length || (q.topicId !== undefined && q.topicId !== null && topic.includes(q.topicId));
      const levelMatch = !level || q.level === level;
      return subjectMatch && topicMatch && levelMatch;
    });
    // Debug: log filtered questions
    // Remove/comment this in production
    // eslint-disable-next-line no-console
    console.log('Filtered Questions:', this.filteredQuestions);
  }

  resetFilters() {
    this.filterForm.reset({ subject: [], topic: [], level: '' });
    this.filteredQuestions = this.questions;
  }

  addSelectedQuestions() {
    const selected = this.selectedQuestionsControl.value || [];
    this.quizQuestions = [...this.quizQuestions, ...selected.filter(q => !this.quizQuestions.includes(q))];
    this.selectedQuestionsControl.setValue([]);
  }

  isQuestionSelected(question: Question): boolean {
    const selected = this.selectedQuestionsControl.value || [];
    return selected.some(q => q.id === question.id);
  }

  onQuestionToggle(question: Question, event: any): void {
    const isChecked = event.checked;
    const currentSelected = this.selectedQuestionsControl.value || [];

    if (isChecked) {
      // Add question if not already selected
      if (!currentSelected.some(q => q.id === question.id)) {
        this.selectedQuestionsControl.setValue([...currentSelected, question]);
      }
    } else {
      // Remove question if unchecked
      const filtered = currentSelected.filter(q => q.id !== question.id);
      this.selectedQuestionsControl.setValue(filtered);
    }
  }

  removeQuestionFromQuiz(question: Question): void {
    this.quizQuestions = this.quizQuestions.filter(q => q.id !== question.id);
  }

  getAvailableQuestions(): Question[] {
    const quizQuestionIds = this.quizQuestions.map(q => q.id);
    return this.filteredQuestions.filter(q => !quizQuestionIds.includes(q.id));
  }

  drop(event: CdkDragDrop<Question[]>): void {
    moveItemInArray(this.quizQuestions, event.previousIndex, event.currentIndex);
  }
}
