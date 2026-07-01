import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewPanelContainerComponent } from './interview-panel-container.component';

describe('InterviewPanelContainerComponent', () => {
  let component: InterviewPanelContainerComponent;
  let fixture: ComponentFixture<InterviewPanelContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewPanelContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewPanelContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
