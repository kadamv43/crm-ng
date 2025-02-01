import { TestBed } from '@angular/core/testing';

import { DayOfferService } from './day-offer.service';

describe('DayOfferService', () => {
  let service: DayOfferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DayOfferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
