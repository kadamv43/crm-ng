import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentLinkListComponent } from './payment-link-list.component';

describe('PaymentLinkListComponent', () => {
  let component: PaymentLinkListComponent;
  let fixture: ComponentFixture<PaymentLinkListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentLinkListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaymentLinkListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
