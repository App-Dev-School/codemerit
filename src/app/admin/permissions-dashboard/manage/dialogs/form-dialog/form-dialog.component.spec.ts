import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { TopicFormComponent } from "./form-dialog.component";
describe("TopicFormComponent", () => {
  let component: TopicFormComponent;
  let fixture: ComponentFixture<TopicFormComponent>;
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [TopicFormComponent],
}).compileComponents();
    })
  );
  beforeEach(() => {
    fixture = TestBed.createComponent(TopicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
