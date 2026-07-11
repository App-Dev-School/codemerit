import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LearningDashboardComponent } from './learning-dashboard.component';

describe('DashboardComponent', () => {
  let component: LearningDashboardComponent;
  let fixture: ComponentFixture<LearningDashboardComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [LearningDashboardComponent],
}).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
