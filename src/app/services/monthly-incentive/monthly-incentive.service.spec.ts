import { TestBed } from '@angular/core/testing';

import { MonthlyIncentiveService } from './monthly-incentive.service';

describe('MonthlyIncentiveService', () => {
  let service: MonthlyIncentiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonthlyIncentiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
