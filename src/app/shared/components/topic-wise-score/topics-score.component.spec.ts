import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicsScore } from './topics-score.component';

describe('TopicsScore', () => {
  let component: TopicsScore;
  let fixture: ComponentFixture<TopicsScore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicsScore]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicsScore);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
