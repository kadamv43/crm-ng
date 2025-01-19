import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentLinkCreateComponent } from './payment-link-create.component';

describe('PaymentLinkCreateComponent', () => {
  let component: PaymentLinkCreateComponent;
  let fixture: ComponentFixture<PaymentLinkCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentLinkCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentLinkCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
