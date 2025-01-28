import { TestBed } from '@angular/core/testing';

import { UserLeadsService } from './user-leads.service';

describe('UserLeadsService', () => {
  let service: UserLeadsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserLeadsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
