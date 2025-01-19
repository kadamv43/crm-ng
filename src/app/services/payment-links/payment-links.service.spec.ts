import { TestBed } from '@angular/core/testing';

import { PaymentLinksService } from './payment-links.service';

describe('PaymentLinksService', () => {
  let service: PaymentLinksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentLinksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
