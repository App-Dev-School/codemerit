import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { permissionsComponent } from "./permissions.component";
describe("permissionsComponent", () => {
  let component: permissionsComponent;
  let fixture: ComponentFixture<permissionsComponent>;
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [permissionsComponent],
}).compileComponents();
    })
  );
  beforeEach(() => {
    fixture = TestBed.createComponent(permissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
