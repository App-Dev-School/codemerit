import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeseriesChartComponent } from './timeseries-chart.component';

describe('TimeseriesChartComponent', () => {
  let component: TimeseriesChartComponent;
  let fixture: ComponentFixture<TimeseriesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeseriesChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeseriesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
