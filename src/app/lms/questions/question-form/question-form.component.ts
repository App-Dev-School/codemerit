import { Component, Inject, OnInit, Optional, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Status } from '@core/models/status.enum';
import { Subject } from '@core/models/subject';
import { MasterService } from '@core/service/master.service';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { TopicItem } from '../../topics/manage/topic-item.model';
import { QuestionItem, QuestionItemDetail } from '../manage/question-item.model';
import { QuestionService } from '../manage/questions.service';
import { NgTemplateOutlet } from '@angular/common';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Code from '@tiptap/extension-code';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { SnackbarService } from '@core/service/snackbar.service';
import { AuthService, User } from '@core';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgTemplateOutlet,
    TiptapEditorDirective,
  ]
})
export class QuestionFormPage implements OnInit, OnDestroy {
  editor: Editor;
  answerEditor: Editor;
  questionSlug: string;
  action: string;
  actionText: string;
  dialogTitle: string;
  loading: boolean;
  submitted: boolean;
  questionForm: UntypedFormGroup;
  initialFormValue: any;
  questionItem: QuestionItem | QuestionItemDetail;
  subjects: Subject[] = [];
  topics: TopicItem[] = [];
  authData: User;

  // Searchable dropdown state
  subjectSearch = '';
  topicSearch = '';
  showSubjectPanel = false;
  showTopicPanel = false;

  get filteredSubjects(): Subject[] {
    const q = this.subjectSearch.toLowerCase();
    return q ? this.subjects.filter(s => s.title.toLowerCase().includes(q)) : this.subjects;
  }

  get filteredTopics(): TopicItem[] {
    const q = this.topicSearch.toLowerCase();
    return q ? this.topics.filter(t => t.title.toLowerCase().includes(q)) : this.topics;
  }

  get selectedSubjectName(): string {
    const id = this.questionForm?.get('subjectId')?.value;
    return this.subjects.find(s => '' + s.id === '' + id)?.title || '';
  }

  selectSubject(subject: Subject): void {
    this.questionForm.patchValue({ subjectId: '' + subject.id, topicIds: [] });
    this.subjectSearch = '';
    this.showSubjectPanel = false;
    this.topics = this.masterSrv.topics.filter(t => t.subjectId == subject.id);
  }

  isTopicSelected(id: number): boolean {
    return ((this.questionForm?.get('topicIds')?.value ?? []) as number[]).includes(id);
  }

  toggleTopic(id: number): void {
    const current: number[] = this.questionForm?.get('topicIds')?.value ?? [];
    const updated = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    this.questionForm.patchValue({ topicIds: updated });
  }

  getSelectedTopics(): TopicItem[] {
    const ids: number[] = this.questionForm?.get('topicIds')?.value ?? [];
    return this.masterSrv.topics.filter(t => ids.includes(t.id));
  }

  removeTopic(id: number): void {
    this.toggleTopic(id);
  }

  onSubjectBlur(): void {
    setTimeout(() => { this.showSubjectPanel = false; this.subjectSearch = ''; }, 200);
  }

  onTopicBlur(): void {
    setTimeout(() => { this.showTopicPanel = false; this.topicSearch = ''; }, 200);
  }
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private masterSrv: MasterService,
    private fb: UntypedFormBuilder,
    private snackService: SnackbarService,
    public authService: AuthService,
    @Optional() public dialogRef?: MatDialogRef<CoursePickerComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any
  ) {
    this.authData = this.authService.currentUserValue;
    this.questionItem = new QuestionItemDetail();
    this.questionForm = this.createQuestionForm();
    this.subjects = this.masterSrv.subjects;
    this.topics = this.masterSrv.topics;
    // Initialize Tiptap editor for question field
    this.editor = new Editor({
      extensions: [StarterKit, Code],
      content: this.questionItem.question || '',
      onUpdate: ({ editor }) => {
        //Switch to source view
        //this.questionSource = editor.getHTML() || '';
        //console.log("QuestionForm Editor Content onUpdate ", this.questionSource);
        this.questionForm.get('question')?.setValue(editor.getHTML(), { emitEvent: false });
      }
    });
    this.answerEditor = new Editor({
      extensions: [StarterKit, Code],
      content: this.questionItem.answer || '',
      onUpdate: ({ editor }) => {
        this.questionForm.get('answer')?.setValue(editor.getHTML(), { emitEvent: false });
      }
    });
    if (this.dialogRef) {
      //this.mode = 'dialog';
      //this.userId = data?.id;
      console.log("QuestionForm dialogRef exists ");
    }
  }

  createQuestionForm(): UntypedFormGroup {
    return this.fb.group({
      id: ['' + this.questionItem?.id],
      question: [this.questionItem.question, [Validators.required, Validators.minLength(3)]],
      subjectId: ['' + this.questionItem.subjectId, [Validators.required]],
      level: ['' + this.questionItem.level, [Validators.required]],
      marks: ['' + this.questionItem.marks],
      orderId: ['' + this.questionItem.orderId],
      timeAllowed: ['' + this.questionItem.timeAllowed, [Validators.required]],
      status: [this.questionItem.status],
      questionType: [this.questionItem.questionType, [Validators.required]],
      topicIds: [[], [Validators.required]],
      hint: [this.questionItem.hint],
      answer: [this.questionItem.answer],
      hideOtherFields: [true]
    });

  }

  ngOnInit() {
    // Sync editor content if form in edit mode
    this.questionForm.get('question')?.valueChanges.subscribe(val => {
      if (val !== this.editor.getHTML()) {
        this.editor.commands.setContent(val || '');
      }
    });
    this.questionForm.get('answer')?.valueChanges.subscribe(val => {
      if (val !== this.answerEditor.getHTML()) {
        this.answerEditor.commands.setContent(val || '');
      }
    });
    console.log("QuestionForm Dialog Data ", this.data);
    this.questionSlug = this.route.snapshot.paramMap.get('question-slug');
    console.log("QuestionForm  ", this.questionSlug);
    if (this.questionSlug || this.data?.action === 'update') {
      this.action = 'edit';
      this.actionText = 'Updating Question';
      this.dialogTitle = 'Update Question';
      //Capture data from dialog
      if (this.data && this.data?.questionItem) {
        this.loading = false;
        this.questionItem = this.data?.questionItem;
        //Must be called after data populated
        this.patchForm(this.questionItem);
        this.initialFormValue = this.questionForm.getRawValue();
      } else {
        this.loadQuestion(this.questionSlug);
      }
    } else {
      this.action = 'create';
      this.actionText = 'Creating Question';
      this.dialogTitle = 'Create New Question';
    }

    this.questionForm.get('subjectId')?.valueChanges.subscribe(subject => {
      this.topics = this.masterSrv.topics;
      if (subject > 0) {
        this.topics = this.topics.filter(topic => topic.subjectId == subject);
      }
    });
    this.questionForm.get('questionType')?.valueChanges.subscribe(type => {
      if (type === 'Trivia') {
        this.questionForm.addControl('options', this.fb.array([
          this.createOption(),
          this.createOption()
        ]));

        this.questionForm.get('options').setValidators(this.atLeastOneCorrectOption());
        // if (this.options.length < 2) {
        //   this.options.clear();
        //   this.addOption();
        //   this.addOption();
        // }
      } else {
        this.questionForm.addControl('options', this.fb.array([]));
        this.options.clear();
      }
    });
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  createOption(): UntypedFormGroup {
    return this.fb.group({
      id: [null],
      option: ['', Validators.required],
      correct: [false] // Optional if needed
    });
  }

  addOption() {
    this.options.push(this.createOption());
  }

  removeOption(index: number) {
    if (this.options.length > 2) {
      this.options.removeAt(index);
    }
  }

  atLeastOneCorrectOption(): ValidatorFn {
    return (formArray: AbstractControl): { [key: string]: any } | null => {
      const options = formArray.value as Array<{ option: string, correct: boolean }>;
      const hasAtLeastOneCorrect = options?.some(opt => opt.correct);
      return hasAtLeastOneCorrect ? null : { noCorrectOption: true };
    };
  }

  onCancel() {
    this.questionForm.reset();
    if (this.data && this.data.questionItem) {
      this.dialogRef.close(null);
    }
  }

  submit() {
    if (this.questionForm.valid) {
      this.submitted = true;
      const formData = this.questionForm.getRawValue();
      if (this.action === 'edit') {
        const changedFields: any = {};
        // Compare each field
        for (const key in formData) {
          if (formData.hasOwnProperty(key)) {
            if (formData[key] !== this.initialFormValue[key]) {
              changedFields[key] = formData[key];
            }
          }
        }
        changedFields['questionType'] = formData.questionType;
        changedFields['subjectId'] = this.questionItem.subjectId;
        this.questionItem.topicIds = formData.topicIds;
        changedFields['topicIds'] = this.questionItem.topicIds;
        changedFields['source'] = 'app';
        console.log('QuestionManager Changed fields:', changedFields);
        this.questionService
          .updateQuestion(changedFields, formData.id)
          .subscribe({
            next: (response) => {
              if (response?.message) {
                this.snackService.display('snackbar-dark', response?.message, 'bottom', 'center');
              }
              this.submitted = false;
              this.navigateToQuestionList(response);
            },
            error: (error) => {
              this.submitted = false;
              console.error('QuestionManager ###Update Error:', error);
              this.snackService.display('snackbar-dark', "Error updating question.", 'bottom', 'center');
            },
          });
      } else {
        // Add new question
        const payload = {
          question: formData.question,
          subjectId: Number.parseInt(formData.subjectId),
          questionType: formData.questionType,
          title: "",
          level: Number.parseInt(formData.level),
          status: this.authData.role === 'Admin' ? formData.status : Status.Pending,
          orderId: formData.orderId,
          marks: formData.marks,
          timeAllowed: formData.timeAllowed,
          topicIds: formData.topicIds,
          hint: formData.hint,
          answer: formData.answer
        }
        if (formData.questionType === 'Trivia') {
          payload['options'] = formData.options;
        }
        this.questionService
          .addQuestion(payload)
          .subscribe({
            next: (response) => {
              console.log('QuestionManager CreateAPI response:', response);
              this.submitted = false;
              if (response?.message) {
                this.snackService.display('snackbar-dark', response?.message, 'bottom', 'center');
              }
              this.navigateToQuestionList(response);
            },
            error: (error) => {
              this.submitted = false;
              this.snackService.display('snackbar-dark', error ? error : "Error adding question. Please try again.", 'bottom', 'center');
            },
          });
      }
    }
  }

  restrictInput(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) return;
    if (!/^\d$/.test(key) || input.value.length >= 2) {
      event.preventDefault();
    }
  }

  loadQuestion(slug: string) {
    if (slug.length > 1) {
      this.loading = true;
      this.questionService
        .getQuestionBySlug(slug)
        .subscribe({
          next: (response: QuestionItemDetail) => {
            console.log('QuestionManager Get API response:', response);
            this.loading = false;
            this.questionItem = response;
            //Must be called after data populated
            this.patchForm(response);
            this.initialFormValue = this.questionForm.getRawValue();
          },
          error: (error) => {
            this.loading = false;
            console.error('QuestionManager Get API Error:', error);
          },
        });
    }
  }

  patchForm(data: QuestionItemDetail): void {
    let topicIds = [];
    if (data.topics && data.topics.length > 0) {
      topicIds = data.topics.map(topic => topic.id);
      this.questionItem.topicIds = topicIds;
    }
    this.questionForm.patchValue({
      id: data.id,
      question: data.question,
      subjectId: '' + data.subjectId,
      level: '' + data.level,
      marks: '' + data.marks,
      orderId: '' + data.orderId,
      timeAllowed: '' + data.timeAllowed,
      status: data.status,
      questionType: data.questionType,
      hint: data.hint,
      answer: data.answer,
      topicIds: topicIds || []
    });

    if (data.questionType === 'Trivia' && data.options?.length) {
      console.log("QuestionEditor Patch Options", data.options);
      const optionControls = data.options.map(opt => this.fb.group({
        id: [opt.id],
        option: [opt.option, Validators.required],
        correct: [opt.correct]
      }));
      console.log("QuestionEditor optionControls", optionControls);

      this.questionForm.setControl('options', this.fb.array(optionControls, this.atLeastOneCorrectOption()));
    } else {
      this.questionForm.setControl('options', this.fb.array([]));
    }
    //console.log("QuestionEditor Patch Topics", data.topicIds);
  }


  navigateToQuestionList(resultData: any) {
    if (this.data) {
      this.dialogRef.close(resultData);
    } else {
      this.snackService.display('snackbar-dark', (resultData?.message) ?? "Question added.", 'bottom', 'center');
      this.router.navigate(['/lms/questions/list']);
    }
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.destroy();
    }
    if (this.answerEditor) {
      this.answerEditor.destroy();
    }
  }
}
