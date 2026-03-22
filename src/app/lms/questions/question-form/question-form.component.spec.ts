import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { QuestionFormPage } from "./question-form.component";
describe("QuestionFormPage", () => {
  let component: QuestionFormPage;
  let fixture: ComponentFixture<QuestionFormPage>;
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [QuestionFormPage],
}).compileComponents();
    })
  );
  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
