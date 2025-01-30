import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpectedPaymentFormComponent } from './expected-payment-form.component';

describe('ExpectedPaymentFormComponent', () => {
  let component: ExpectedPaymentFormComponent;
  let fixture: ComponentFixture<ExpectedPaymentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpectedPaymentFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpectedPaymentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
