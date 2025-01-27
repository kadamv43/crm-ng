import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyIncentiveEditComponent } from './monthly-incentive-edit.component';

describe('MonthlyIncentiveEditComponent', () => {
  let component: MonthlyIncentiveEditComponent;
  let fixture: ComponentFixture<MonthlyIncentiveEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyIncentiveEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonthlyIncentiveEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
