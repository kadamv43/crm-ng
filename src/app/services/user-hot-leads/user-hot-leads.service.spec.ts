import { TestBed } from '@angular/core/testing';

import { UserHotLeadsService } from './user-hot-leads.service';

describe('UserHotLeadsService', () => {
  let service: UserHotLeadsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserHotLeadsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
