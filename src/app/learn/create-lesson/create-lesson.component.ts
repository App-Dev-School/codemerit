import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SnackbarService } from '@core/service/snackbar.service';
import { Editor } from '@tiptap/core';
import Code from '@tiptap/extension-code';
import StarterKit from '@tiptap/starter-kit';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { QuizService } from 'src/app/quiz/quiz.service';
import { LessonService } from '../lesson.service';

@Component({
  selector: 'app-create-lesson',
  templateUrl: './create-lesson.component.html',
  styleUrls: ['./create-lesson.component.scss'],
    standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TiptapEditorDirective
  ]
})
export class CreateLessonComponent implements OnInit, OnDestroy {
  lessonForm: FormGroup;
  submitted = false;
  descriptionEditors: Editor[] = [];
  subjects: any[] = [];
  topics: any[] = [];
  filteredTopics: any[] = [];
  difficultyOptions = [
    { label: 'Easy', value: 1 },
    { label: 'Intermediate', value: 2 },
    { label: 'Advanced', value: 3 },
  ];

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private lessonService: LessonService,
    private snackService: SnackbarService
  ) {}

  ngOnInit(): void {
    this.lessonForm = this.fb.group({
      title: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      topic: ['', [Validators.required]],
      level: [1, [Validators.required]],
      descriptions: this.fb.array([this.createDescription()])
    });
    this.descriptionEditors = [this.createEditor()];
    this.loadSubjectsTopics();
  }

  get descriptions(): FormArray {
    return this.lessonForm.get('descriptions') as FormArray;
  }

  addDescription(): void {
    this.descriptions.push(this.createDescription());
    this.descriptionEditors.push(this.createEditor());
  }

  onSubjectChange(subjectId: number): void {
    this.filteredTopics = this.topics.filter((topic: any) => {
      const topicSubjectId = topic.subjectId ?? topic.subject?.id;
      return Number(topicSubjectId) === Number(subjectId);
    });
    this.lessonForm.get('topic')?.setValue('');
  }

  removeDescription(index: number): void {
    if (this.descriptions.length > 1) {
      this.descriptions.removeAt(index);
      this.descriptionEditors[index]?.destroy();
      this.descriptionEditors.splice(index, 1);
    }
  }

  submit(): void {
    this.submitted = true;
    if (this.lessonForm.valid) {
      const payload = {
        title: this.lessonForm.value.title,
        subject: this.lessonForm.value.subject,
        topic: this.lessonForm.value.topic,
        level: this.lessonForm.value.level,
        descriptions: this.lessonForm.value.descriptions
      };
      this.lessonService.createLesson(payload).subscribe({
        next: (res) => {
          this.snackService.display('snackbar-dark', res?.message ?? 'Your new lesson is created successfully.', 'bottom', 'center');
          this.resetForm();
          this.router.navigate(['/learn/overview', res?.data?.lesson?.slug]);
        },
        error: (error) => {
          this.snackService.display('snackbar-dark', error?.error?.message ?? 'Failed to create lesson', 'bottom', 'center');
          console.error('Failed to create lesson', error);
        }
      });
    }
  }

  private createDescription() {
    return this.fb.control('', [Validators.required]);
  }

  private loadSubjectsTopics(): void {
    this.quizService.getSubjectsTopics().subscribe({
      next: (res: any) => {
        this.subjects = res?.data?.subjects || [];
        this.topics = res?.data?.topics || [];
        this.filteredTopics = [...this.topics];
      },
      error: (error) => {
        console.error('Failed to load subjects/topics', error);
      }
    });
  }

  private createEditor(): Editor {
    let instance: Editor;
    instance = new Editor({
      extensions: [StarterKit, Code],
      content: '',
      onUpdate: ({ editor }) => {
        const index = this.descriptionEditors.indexOf(instance);
        this.descriptions.at(index)?.setValue(editor.getHTML(), { emitEvent: false });
      }
    });
    return instance;
  }

  private resetForm(): void {
    this.submitted = false;
    this.descriptionEditors.forEach((editor) => editor.destroy());
    this.lessonForm.reset({
      title: '',
      subject: '',
      topic: '',
      level: 1
    });
    this.descriptions.clear();
    this.descriptions.push(this.createDescription());
    this.descriptionEditors = [this.createEditor()];
  }

  ngOnDestroy(): void {
    this.descriptionEditors.forEach((editor) => editor.destroy());
  }
}
