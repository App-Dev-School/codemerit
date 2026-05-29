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
import { MasterService } from '@core/service/master.service';
import {
  QuestionItem,
  FullQuestion,
} from 'src/app/lms/questions/manage/question-item.model';
import {
  QuestionApiFilters,
  QuestionService,
} from 'src/app/lms/questions/manage/questions.service';
import { TopicItem } from 'src/app/lms/topics/manage/topic-item.model';

export interface QuestionFilterValue {
  subject: number | null;
  topic: number | null;
  subjectIds: string[];
  topicIds: string[];
  level: string;
  authorId: number;
}

type QuizQuestionsFormMode = 'quiz-builder' | 'filter-only';

interface Question {
  id: number;
  selectionKey: string;
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
  @Input() selectedQuestions: Question[] = [];
  showFilter = true;
  filterForm: FormGroup;
  @Input() subjects: any[] = [];
  @Input() topics: any[] = [];
  @Input() authors: any[] = [];
  @Input() questions: Question[] = [];
  allQuestions: Question[] = [];
  filteredQuestions: Question[] = [];
  filteredTopics: any[] = [];
  questionSearchControl = new FormControl('');
  selectedQuestionsControl = new FormControl<Question[]>([]);
  quizQuestions: Question[] = [];

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private questionService: QuestionService,
  ) {
    this.filterForm = this.fb.group({
      subject: [null],
      topic: [null],
      level: [''],
      authorId: [0],
    });
  }

  ngOnInit(): void {
    this.allQuestions = [...this.questions];
    this.filteredQuestions = [...this.questions];
    this.filteredTopics = [...this.topics];
    this.restoreSelectedQuestions();
    this.filterForm.get('subject')?.valueChanges.subscribe((subjectId) => {
      this.syncTopics(subjectId ?? null);
    });
    this.restoreViewState();

    // Fetch subjects and topics from API
    this.masterService.fetchMasterDataFromAPI().subscribe(() => {
      this.subjects = this.masterService.subjects;
      this.topics = this.masterService.topics;
      this.filteredTopics = [...this.topics];
      const selectedSubject = this.filterForm.get('subject')?.value ?? null;
      this.syncTopics(selectedSubject);
      this.restoreViewState();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['questions'] && !changes['questions'].firstChange) {
      this.allQuestions = [...this.questions];
      this.filteredQuestions = [...this.questions];
      this.restoreViewState();
    }

    if (changes['topics']) {
      const selectedSubject = this.filterForm.get('subject')?.value ?? null;
      this.syncTopics(selectedSubject);
    }

    if (changes['initialFilters']) {
      this.restoreViewState();
    }

    // Update selected questions whenever they change from parent
    if (changes['selectedQuestions']) {
      this.restoreSelectedQuestions();
    }
  }

  applyFilters() {
    const { subject, topic, level, authorId } = this.filterForm.value;
    const selectedSubjects = Array.isArray(subject)
      ? subject.map((value) => Number(value))
      : subject === null || subject === undefined || subject === ''
        ? []
        : [Number(subject)];
    const selectedTopics = Array.isArray(topic)
      ? topic.map((value) => Number(value))
      : topic === null || topic === undefined || topic === ''
        ? []
        : [Number(topic)];
    const filters: QuestionFilterValue = {
      subject: selectedSubjects[0] ?? null,
      topic: selectedTopics[0] ?? null,
      subjectIds: selectedSubjects.map((value) => String(value)),
      topicIds: selectedTopics.map((value) => String(value)),
      level: level ?? '',
      authorId: Number(authorId) || 0,
    };

    this.filtersApplied.emit(filters);

    if (this.mode === 'quiz-builder') {
      this.loadQuestionsFromApi(filters, () => {
        this.showFilter = false;
      });
      return;
    }

    this.loadQuestionsFromApi(filters);
  }

  resetFilters() {
    const filters: QuestionFilterValue = {
      subject: null,
      topic: null,
      subjectIds: [],
      topicIds: [],
      level: '',
      authorId: 0,
    };

    this.filterForm.reset({
      subject: this.mode === 'quiz-builder' ? [] : null,
      topic: this.mode === 'quiz-builder' ? [] : null,
      level: '',
      authorId: 0,
    });
    this.questionSearchControl.setValue('', { emitEvent: false });
    this.filteredTopics = [...this.topics];
    this.loadQuestionsFromApi(filters);
    this.filtersApplied.emit(filters);
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  addSelectedQuestions() {
    const selected = this.selectedQuestionsControl.value || [];
    this.quizQuestions = [
      ...this.quizQuestions,
      ...selected.filter(
        (q) =>
          !this.quizQuestions.some(
            (existing) => existing.selectionKey === q.selectionKey,
          ),
      ),
    ];
    this.selectedQuestionsControl.setValue([]);
    this.questionsAdded.emit(this.quizQuestions);
  }

  isQuestionSelected(question: Question): boolean {
    const selected = this.selectedQuestionsControl.value || [];
    return selected.some((q) => q.selectionKey === question.selectionKey);
  }

  onQuestionToggle(question: Question, event: any): void {
    const isChecked = event.checked;
    const currentSelected = this.selectedQuestionsControl.value || [];

    if (isChecked) {
      // Add question if not already selected
      if (
        !currentSelected.some((q) => q.selectionKey === question.selectionKey)
      ) {
        this.selectedQuestionsControl.setValue([...currentSelected, question]);
      }
    } else {
      // Remove question if unchecked
      const filtered = currentSelected.filter(
        (q) => q.selectionKey !== question.selectionKey,
      );
      this.selectedQuestionsControl.setValue(filtered);
    }
  }

  removeQuestionFromQuiz(question: Question): void {
    this.quizQuestions = this.quizQuestions.filter(
      (q) => q.selectionKey !== question.selectionKey,
    );
    this.questionsAdded.emit(this.quizQuestions);
  }

  getAvailableQuestions(): Question[] {
    const quizQuestionIds = new Set(
      this.quizQuestions.map((q) => q.selectionKey),
    );
    const searchText = (this.questionSearchControl.value ?? '')
      .toString()
      .trim()
      .toLowerCase();

    return this.filteredQuestions.filter((question) => {
      const isNotSelected = !quizQuestionIds.has(question.selectionKey);

      if (!searchText) {
        return isNotSelected;
      }

      const searchableText = [
        question.title
      ]
        .join(' ')
        .toLowerCase();

      return isNotSelected && searchableText.includes(searchText);
    });
  }

  getLevelDisplay(level: number | string | undefined): string {
    switch (Number(level)) {
      case 1:
        return 'Easy';
      case 2:
        return 'Intermediate';
      case 3:
        return 'Advanced';
      default:
        return level ? String(level) : '';
    }
  }

  private syncTopics(subjectId: number | number[] | null): void {
    if (
      subjectId === null ||
      subjectId === undefined ||
      subjectId === 0 ||
      (Array.isArray(subjectId) && subjectId.length === 0)
    ) {
      this.filteredTopics = [...this.topics];
      return;
    }

    const subjectIds = Array.isArray(subjectId)
      ? subjectId.map((value) => Number(value))
      : [Number(subjectId)];

    this.filteredTopics = this.topics.filter((topic: any) => {
      const topicSubjectId = topic.subjectId ?? topic.subject?.id;
      return subjectIds.includes(Number(topicSubjectId));
    });

    const selectedTopic = this.filterForm.get('topic')?.value;
    const topicStillValid = Array.isArray(selectedTopic)
      ? selectedTopic.every((topicId) =>
          this.filteredTopics.some((topic: any) => topic.id === topicId),
        )
      : this.filteredTopics.some((topic: any) => topic.id === selectedTopic);

    if (!topicStillValid) {
      this.filterForm
        .get('topic')
        ?.setValue(this.mode === 'quiz-builder' ? [] : null);
    }
  }

  private applyInitialFilters(): void {
    const filters = this.normalizeFilters(this.initialFilters);
    if (!filters) {
      return;
    }

    const subject =
      this.mode === 'quiz-builder'
        ? filters.subjectIds.map((value) => Number(value))
        : (filters.subject ?? null);
    this.filterForm.patchValue(
      {
        subject,
        level: filters.level ?? '',
        authorId: filters.authorId ?? 0,
      },
      { emitEvent: false },
    );

    this.syncTopics(subject);

    this.filterForm.patchValue(
      {
        topic:
          this.mode === 'quiz-builder'
            ? filters.topicIds.map((value) => Number(value))
            : (filters.topic ?? null),
      },
      { emitEvent: false },
    );
  }

  private restoreSelectedQuestions(): void {
    this.quizQuestions = [...(this.selectedQuestions ?? [])];
    this.selectedQuestionsControl.setValue([], { emitEvent: false });
  }

  private restoreViewState(): void {
    this.restoreSelectedQuestions();

    const filters = this.normalizeFilters(this.initialFilters);

    if (!this.hasActiveFilters(filters)) {
      this.showFilter = true;
      return;
    }

    this.applyInitialFilters();
    this.loadQuestionsFromApi(filters as QuestionFilterValue, () => {
      this.showFilter = false;
    });
  }

  private hasActiveFilters(filters: QuestionFilterValue | null): boolean {
    if (!filters) {
      return false;
    }

    return (
      filters.subjectIds.length > 0 ||
      filters.topicIds.length > 0 ||
      !!filters.level ||
      filters.authorId > 0 ||
      filters.subject !== null ||
      filters.topic !== null
    );
  }

  private normalizeFilters(
    filters: Partial<QuestionFilterValue> | null,
  ): QuestionFilterValue | null {
    if (!filters) {
      return null;
    }

    const normalized: QuestionFilterValue = {
      subject: filters.subject ?? null,
      topic: filters.topic ?? null,
      subjectIds: Array.isArray(filters.subjectIds) ? filters.subjectIds : [],
      topicIds: Array.isArray(filters.topicIds) ? filters.topicIds : [],
      level: filters.level ?? '',
      authorId: Number(filters.authorId ?? 0),
    };

    return this.hasActiveFilters(normalized) ? normalized : null;
  }

  private applyLocalFilters(filters: QuestionFilterValue): void {
    const selectedSubjects = new Set(
      filters.subjectIds.map((value) => Number(value)),
    );
    const selectedTopics = new Set(
      filters.topicIds.map((value) => Number(value)),
    );

    this.filteredQuestions = this.allQuestions.filter((question) => {
      const subjectMatch =
        selectedSubjects.size === 0 ||
        selectedSubjects.has(Number(question.subjectId));
      const topicMatch =
        selectedTopics.size === 0 ||
        selectedTopics.has(Number(question.topicId));
      const levelMatch =
        !filters.level || String(question.level) === filters.level;

      return subjectMatch && topicMatch && levelMatch;
    });
  }

  private loadQuestionsFromApi(
    filters: QuestionFilterValue,
    onSuccess?: () => void,
  ): void {
    const apiFilters: QuestionApiFilters = {
      subject: filters.subject,
      topic: filters.topic,
      subjectIds: filters.subjectIds,
      topicIds: filters.topicIds,
      level: filters.level,
      authorId: filters.authorId,
    };

    const request$ =
      this.mode === 'quiz-builder'
        ? this.questionService.getQuizBuilderQuestionsWithFilters(apiFilters)
        : this.questionService.getQuestionsWithFilters(false, apiFilters);

    request$.subscribe({
      next: (questions) => {
        const mappedQuestions = questions.map((question) =>
          this.mapApiQuestion(question),
        );
        this.questions = mappedQuestions;
        this.allQuestions = mappedQuestions;
        this.filteredQuestions = mappedQuestions;
        onSuccess?.();
      },
      error: () => {
        this.questions = [];
        this.allQuestions = [];
        this.filteredQuestions = [];
      },
    });
  }

  private mapApiQuestion(question: QuestionItem | FullQuestion): Question {
    const fullQuestion = question as FullQuestion;
    const topicTitles = Array.isArray((question as FullQuestion).topics)
      ? ((question as FullQuestion).topics ?? []).map((topic) => topic.title)
      : (question.topicIds ?? [])
          .map(
            (topicId) =>
              this.topics.find((topic: any) => topic.id === topicId)?.title,
          )
          .filter((title): title is string => !!title);

    return {
      id: (question as any).questionid ?? question.id ?? 0,
      selectionKey: this.getQuestionSelectionKey(question),
      title: question.title?.trim()
        ? question.title
        : (question.question ?? ''),
      subject: fullQuestion.subject?.title ?? question.subjectName ?? '',
      topic: topicTitles.join(', '),
      subjectId: fullQuestion.subject?.id ?? question.subjectId,
      topicId: fullQuestion.topics?.[0]?.id ?? question.topicIds?.[0],
      level: String(question.level ?? ''),
    };
  }

  private getQuestionSelectionKey(
    question: QuestionItem | FullQuestion,
  ): string {
    const resolvedId = (question as any).questionid ?? question.id;
    if (resolvedId !== null && resolvedId !== undefined) {
      return `id:${resolvedId}`;
    }

    if (question.slug) {
      return `slug:${question.slug}`;
    }

    return [
      question.title ?? question.question ?? '',
      question.subjectId ?? '',
      (question.topicIds ?? []).join(','),
      question.level ?? '',
    ].join('|');
  }

  drop(event: CdkDragDrop<Question[]>): void {
    moveItemInArray(
      this.quizQuestions,
      event.previousIndex,
      event.currentIndex,
    );
  }
}
