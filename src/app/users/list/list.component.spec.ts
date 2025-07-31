import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { ListUserComponent } from "./list.component";
describe("InboxComponent", () => {
  let component: ListUserComponent;
  let fixture: ComponentFixture<ListUserComponent>;
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
    imports: [ListUserComponent],
}).compileComponents();
    })
  );
  beforeEach(() => {
    fixture = TestBed.createComponent(ListUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
