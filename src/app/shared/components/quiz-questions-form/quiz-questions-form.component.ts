import {
  Component,
  OnChanges,
  OnInit,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  CdkDragDrop,
  moveItemInArray,
  CdkDropList,
  CdkDrag,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgScrollbar } from 'ngx-scrollbar';
import { MatIcon } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NgTemplateOutlet } from '@angular/common';

export interface QuestionFilterValue {
  subject: number | null;
  topic: number | null;
  level: string;
  authorId: number;
}

type QuizQuestionsFormMode = 'quiz-builder' | 'filter-only';

interface Question {
  id: number;
  title: string;
  subject: string; // name
  topic: string; // name
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
    MatCheckboxModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    NgScrollbar,
  ],
})
export class QuizQuestionsFormComponent implements OnInit, OnChanges {
  @Output() questionsAdded = new EventEmitter<any[]>();
  @Output() filtersApplied = new EventEmitter<QuestionFilterValue>();
  @Input() mode: QuizQuestionsFormMode = 'quiz-builder';
  @Input() title = 'Filter Questions';
  @Input() initialFilters: QuestionFilterValue | null = null;
  showFilter = true;
  filterForm: FormGroup;
  @Input() subjects: any[] = [];
  @Input() topics: any[] = [];
  @Input() authors: any[] = [];
  @Input() questions: Question[] = [];
  filteredQuestions: Question[] = [];
  filteredTopics: any[] = [];
  selectedQuestionsControl = new FormControl<Question[]>([]);
  quizQuestions: Question[] = [];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      subject: [null],
      topic: [null],
      level: [''],
      authorId: [0],
    });
  }

  ngOnInit(): void {
    this.filteredQuestions = [...this.questions];
    this.filteredTopics = [...this.topics];
    this.filterForm.get('subject')?.valueChanges.subscribe((subjectId) => {
      this.syncTopics(subjectId ?? null);
    });
    this.applyInitialFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questions'] && !changes['questions'].firstChange) {
      this.filteredQuestions = [...this.questions];
    }

    if (changes['topics']) {
      const selectedSubject = this.filterForm.get('subject')?.value ?? null;
      this.syncTopics(selectedSubject);
    }

    if (changes['initialFilters']) {
      this.applyInitialFilters();
    }
  }

  applyFilters() {
    const { subject, topic, level, authorId } = this.filterForm.value;
    this.filteredQuestions = this.questions.filter((q) => {
      const subjectMatch =
        subject === null ||
        subject === undefined ||
        subject === '' ||
        q.subjectId === Number(subject);
      const topicMatch =
        topic === null ||
        topic === undefined ||
        topic === '' ||
        q.topicId === Number(topic);
      const levelMatch = !level || q.level === level;
      return subjectMatch && topicMatch && levelMatch;
    });

    const filters: QuestionFilterValue = {
      subject:
        subject === null || subject === undefined || subject === ''
          ? null
          : Number(subject),
      topic:
        topic === null || topic === undefined || topic === ''
          ? null
          : Number(topic),
      level: level ?? '',
      authorId: Number(authorId) || 0,
    };

    if (this.mode === 'filter-only') {
      this.filtersApplied.emit(filters);
      return;
    }

    this.toggleFilter();
  }

  resetFilters() {
    this.filterForm.reset({
      subject: null,
      topic: null,
      level: '',
      authorId: 0,
    });
    this.filteredQuestions = [...this.questions];

    if (this.mode === 'filter-only') {
      this.filtersApplied.emit({
        subject: null,
        topic: null,
        level: '',
        authorId: 0,
      });
    }
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  addSelectedQuestions() {
    const selected = this.selectedQuestionsControl.value || [];
    this.quizQuestions = [
      ...this.quizQuestions,
      ...selected.filter((q) => !this.quizQuestions.includes(q)),
    ];
    this.selectedQuestionsControl.setValue([]);
    this.questionsAdded.emit(this.quizQuestions);
  }

  isQuestionSelected(question: Question): boolean {
    const selected = this.selectedQuestionsControl.value || [];
    return selected.some((q) => q.id === question.id);
  }

  onQuestionToggle(question: Question, event: any): void {
    const isChecked = event.checked;
    const currentSelected = this.selectedQuestionsControl.value || [];

    if (isChecked) {
      // Add question if not already selected
      if (!currentSelected.some((q) => q.id === question.id)) {
        this.selectedQuestionsControl.setValue([...currentSelected, question]);
      }
    } else {
      // Remove question if unchecked
      const filtered = currentSelected.filter((q) => q.id !== question.id);
      this.selectedQuestionsControl.setValue(filtered);
    }
  }

  removeQuestionFromQuiz(question: Question): void {
    this.quizQuestions = this.quizQuestions.filter((q) => q.id !== question.id);
  }

  getAvailableQuestions(): Question[] {
    const quizQuestionIds = this.quizQuestions.map((q) => q.id);
    return this.filteredQuestions.filter(
      (q) => !quizQuestionIds.includes(q.id),
    );
  }

  private syncTopics(subjectId: number | null): void {
    if (subjectId === null || subjectId === undefined || subjectId === 0) {
      this.filteredTopics = [...this.topics];
      return;
    }

    this.filteredTopics = this.topics.filter((topic: any) => {
      const topicSubjectId = topic.subjectId ?? topic.subject?.id;
      return topicSubjectId === Number(subjectId);
    });

    const selectedTopic = this.filterForm.get('topic')?.value;
    const topicStillValid = this.filteredTopics.some(
      (topic: any) => topic.id === selectedTopic,
    );

    if (!topicStillValid) {
      this.filterForm.get('topic')?.setValue(null);
    }
  }

  private applyInitialFilters(): void {
    if (!this.initialFilters) {
      return;
    }

    const subject = this.initialFilters.subject ?? null;
    this.filterForm.patchValue(
      {
        subject,
        level: this.initialFilters.level ?? '',
        authorId: this.initialFilters.authorId ?? 0,
      },
      { emitEvent: false },
    );

    this.syncTopics(subject);

    this.filterForm.patchValue(
      {
        topic: this.initialFilters.topic ?? null,
      },
      { emitEvent: false },
    );
  }

  drop(event: CdkDragDrop<Question[]>): void {
    moveItemInArray(
      this.quizQuestions,
      event.previousIndex,
      event.currentIndex,
    );
  }
}
