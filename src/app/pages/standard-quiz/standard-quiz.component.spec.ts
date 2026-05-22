import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardQuizComponent } from './standard-quiz.component';

describe('StandardQuizComponent', () => {
  let component: StandardQuizComponent;
  let fixture: ComponentFixture<StandardQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandardQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StandardQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
