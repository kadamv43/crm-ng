import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: router }],
    });
    guard = TestBed.inject(AuthGuard);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('lets a logged-in user through', () => {
    localStorage.setItem('token', 'abc');
    expect(guard.canActivate(null as any, null as any)).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redirects to login when there is no token', () => {
    expect(guard.canActivate(null as any, null as any)).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
