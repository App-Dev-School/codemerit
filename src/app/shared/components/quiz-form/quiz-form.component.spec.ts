import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { QuizFormPage } from "./quiz-form.component";
describe("QuizFormPage", () => {
  let component: QuizFormPage;
  let fixture: ComponentFixture<QuizFormPage>;
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [QuizFormPage],
}).compileComponents();
    })
  );
  beforeEach(() => {
    fixture = TestBed.createComponent(QuizFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
