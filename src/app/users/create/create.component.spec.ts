import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { CreateUserComponent } from "./create.component";
describe("ComposeComponent", () => {
  let component: CreateUserComponent;
  let fixture: ComponentFixture<CreateUserComponent>;
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [CreateUserComponent],
}).compileComponents();
    })
  );
  beforeEach(() => {
    fixture = TestBed.createComponent(CreateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
