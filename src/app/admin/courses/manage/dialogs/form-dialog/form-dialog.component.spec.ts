import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { CourseFormComponent } from "./form-dialog.component";
describe("CourseFormComponent", () => {
  let component: CourseFormComponent;
  let fixture: ComponentFixture<CourseFormComponent>;
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [CourseFormComponent],
}).compileComponents();
    })
  );
  beforeEach(() => {
    fixture = TestBed.createComponent(CourseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
