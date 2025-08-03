import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SkillRatingComponent } from './skill-rating.component';

describe('SkillRatingComponent', () => {
  let component: SkillRatingComponent;
  let fixture: ComponentFixture<SkillRatingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillRatingComponent ],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
