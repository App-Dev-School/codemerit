import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TopicDeleteComponent } from './delete.component';
describe('DeleteComponent', () => {
  let component: TopicDeleteComponent;
  let fixture: ComponentFixture<TopicDeleteComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TopicDeleteComponent],
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(TopicDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
