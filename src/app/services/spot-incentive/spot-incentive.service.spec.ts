import { TestBed } from '@angular/core/testing';

import { SpotIncentiveService } from './spot-incentive.service';

describe('SpotIncentiveService', () => {
  let service: SpotIncentiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotIncentiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
