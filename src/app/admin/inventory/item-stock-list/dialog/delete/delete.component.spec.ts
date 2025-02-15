import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ItemStockListDeleteComponent } from './delete.component';
describe('DeleteComponent', () => {
  let component: ItemStockListDeleteComponent;
  let fixture: ComponentFixture<ItemStockListDeleteComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ItemStockListDeleteComponent],
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(ItemStockListDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
