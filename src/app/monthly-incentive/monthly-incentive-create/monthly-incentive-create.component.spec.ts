import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyIncentiveCreateComponent } from './monthly-incentive-create.component';

describe('MonthlyIncentiveCreateComponent', () => {
  let component: MonthlyIncentiveCreateComponent;
  let fixture: ComponentFixture<MonthlyIncentiveCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyIncentiveCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonthlyIncentiveCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
