import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
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
  @Output() questionsAdded = new EventEmitter<any[]>();
  showFilter = true;
  filterForm: FormGroup;
  @Input() subjects: any[] = [];
  @Input() topics: any[] = [];
  @Input() questions: Question[] = [];
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
    this.toggleFilter();
    console.log('Filtered Questions:', this.filteredQuestions);
  }

  resetFilters() {
    this.filterForm.reset({ subject: [], topic: [], level: '' });
    this.filteredQuestions = this.questions;
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  addSelectedQuestions() {
    const selected = this.selectedQuestionsControl.value || [];
    this.quizQuestions = [...this.quizQuestions, ...selected.filter(q => !this.quizQuestions.includes(q))];
    this.selectedQuestionsControl.setValue([]);
    this.questionsAdded.emit(this.quizQuestions);
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
