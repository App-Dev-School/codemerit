import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedOptionDetailComponent } from './selected-option-detail.component';

describe('SelectedOptionDetailComponent', () => {
  let component: SelectedOptionDetailComponent;
  let fixture: ComponentFixture<SelectedOptionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedOptionDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectedOptionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
