import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectTrackerCardComponent } from './subject-tracker-card.component';

describe('SubjectTrackerCardComponent', () => {
  let component: SubjectTrackerCardComponent;
  let fixture: ComponentFixture<SubjectTrackerCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubjectTrackerCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectTrackerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
