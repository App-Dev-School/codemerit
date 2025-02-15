import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IssuedItemsDeleteComponent } from './delete.component';
describe('DeleteComponent', () => {
  let component: IssuedItemsDeleteComponent;
  let fixture: ComponentFixture<IssuedItemsDeleteComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IssuedItemsDeleteComponent],
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(IssuedItemsDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
