import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentLinkEditComponent } from './payment-link-edit.component';

describe('PaymentLinkEditComponent', () => {
  let component: PaymentLinkEditComponent;
  let fixture: ComponentFixture<PaymentLinkEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentLinkEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentLinkEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
