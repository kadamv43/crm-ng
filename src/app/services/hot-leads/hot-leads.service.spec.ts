import { TestBed } from '@angular/core/testing';

import { HotLeadsService } from './hot-leads.service';

describe('HotLeadsService', () => {
  let service: HotLeadsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HotLeadsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
