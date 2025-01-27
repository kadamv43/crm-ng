import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyIncentiveListComponent } from './monthly-incentive-list.component';

describe('MonthlyIncentiveListComponent', () => {
  let component: MonthlyIncentiveListComponent;
  let fixture: ComponentFixture<MonthlyIncentiveListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyIncentiveListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonthlyIncentiveListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
