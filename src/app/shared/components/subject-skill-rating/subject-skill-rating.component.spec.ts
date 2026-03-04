import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import {SubjectSkillRatingComponent} from "./subject-skill-rating.component";
describe("SubjectSkillRatingComponent", () => {
  let component: SubjectSkillRatingComponent;
  let fixture: ComponentFixture<SubjectSkillRatingComponent>;
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [SubjectSkillRatingComponent],
}).compileComponents();
    })
  );
  beforeEach(() => {
    fixture = TestBed.createComponent(SubjectSkillRatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
