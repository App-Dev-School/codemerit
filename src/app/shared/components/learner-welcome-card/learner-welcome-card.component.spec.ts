import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LearnerWelcomeCardComponent } from './learner-welcome-card.component';

describe('LearnerWelcomeCardComponent', () => {
  let component: LearnerWelcomeCardComponent;
  let fixture: ComponentFixture<LearnerWelcomeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearnerWelcomeCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearnerWelcomeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
