import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { permissionsDeleteComponent } from './delete.component';
describe('permissionsDeleteComponent', () => {
  let component: permissionsDeleteComponent;
  let fixture: ComponentFixture<permissionsDeleteComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [permissionsDeleteComponent],
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(permissionsDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
