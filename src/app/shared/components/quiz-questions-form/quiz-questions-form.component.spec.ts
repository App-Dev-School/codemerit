import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizQuestionsFormComponent } from './quiz-questions-form.component';

describe('QuizQuestionsFormComponent', () => {
  let component: QuizQuestionsFormComponent;
  let fixture: ComponentFixture<QuizQuestionsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizQuestionsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizQuestionsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
