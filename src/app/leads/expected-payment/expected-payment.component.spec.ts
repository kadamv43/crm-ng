import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpectedPaymentComponent } from './expected-payment.component';

describe('ExpectedPaymentComponent', () => {
  let component: ExpectedPaymentComponent;
  let fixture: ComponentFixture<ExpectedPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpectedPaymentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpectedPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
