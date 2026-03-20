import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { QuizFormComponent } from "./quiz-form.component";
describe("QuizFormPage", () => {
  let component: QuizFormComponent;
  let fixture: ComponentFixture<QuizFormComponent>;
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [QuizFormComponent],
}).compileComponents();
    })
  );
  beforeEach(() => {
    fixture = TestBed.createComponent(QuizFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
