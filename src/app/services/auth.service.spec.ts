import { discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

describe('AuthService', () => {
    let router: jasmine.SpyObj<Router>;
    let service: AuthService;

    const make = () => {
        router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
        service = new AuthService(router);
    };

    const iso = (ms: number) => new Date(ms).toISOString();

    // A service whose tab wake-up listener is captured instead of attached to
    // the page, so other services alive in the same test run cannot react first.
    const makeCapturingListener = () => {
        service.dispose();
        let wake: () => void = () => undefined;
        spyOn(document, 'addEventListener').and.callFake(((type: string, fn: any) => {
            if (type === 'visibilitychange') {
                wake = fn;
            }
        }) as any);
        make();
        return () => wake();
    };


    beforeEach(() => {
        localStorage.clear();
        make();
    });

    afterEach(() => {
        service.dispose(); // old instances must not react to later tests' events
        localStorage.clear();
    });

    describe('setSession', () => {
        it('keeps the token, when it ends, and the server clock difference', fakeAsync(() => {
            const now = Date.now();
            service.setSession({
                accessToken: 'tok',
                expiresAt: iso(now + 5 * HOUR),
                serverTime: iso(now),
            });
            expect(localStorage.getItem('token')).toBe('tok');
            expect(Number(localStorage.getItem('tokenExpiresAt'))).toBe(now + 5 * HOUR);
            expect(Math.abs(Number(localStorage.getItem('serverSkewMs')))).toBeLessThan(1000);
            expect(service.isLoggedIn()).toBeTrue();
            discardPeriodicTasks();
        }));

        it('falls back to the expiry inside the token when the reply has none', fakeAsync(() => {
            const exp = Math.floor((Date.now() + 2 * HOUR) / 1000);
            const body = btoa(JSON.stringify({ exp }));
            service.setSession({ accessToken: `h.${body}.s` });
            expect(service.getExpiresAt()).toBe(exp * 1000);
            discardPeriodicTasks();
        }));

        it('copes with a token it cannot read', fakeAsync(() => {
            service.setSession({ accessToken: 'not-a-jwt' });
            expect(service.getExpiresAt()).toBeNull();
            expect(service.msLeft()).toBeNull();
            expect(service.isLoggedIn()).toBeTrue(); // the server will answer with a 401 if it is not
            tick(HOUR);
            expect(localStorage.getItem('token')).toBe('not-a-jwt');
            discardPeriodicTasks();
        }));
    });

    describe('isLoggedIn', () => {
        it('is false without a token', () => {
            expect(service.isLoggedIn()).toBeFalse();
        });

        it('is true until the session ends and false after', () => {
            localStorage.setItem('token', 't');
            localStorage.setItem('tokenExpiresAt', String(Date.now() + MIN));
            expect(service.isLoggedIn()).toBeTrue();
            localStorage.setItem('tokenExpiresAt', String(Date.now() - 1));
            expect(service.isLoggedIn()).toBeFalse();
        });
    });

    describe('automatic logout', () => {
        const login = (msUntilEnd: number, skew = 0) => {
            const serverNow = Date.now() + skew;
            service.setSession({
                accessToken: 'tok',
                expiresAt: iso(serverNow + msUntilEnd),
                serverTime: iso(serverNow),
            });
        };

        it('logs out exactly when the session ends and tells the app', fakeAsync(() => {
            let ended = 0;
            service.sessionEnded$.subscribe(() => ended++);
            login(30 * MIN);

            tick(29 * MIN);
            expect(localStorage.getItem('token')).toBe('tok');
            expect(ended).toBe(0);

            tick(MIN + 15000); // past the end (checks run every 15 seconds)
            expect(localStorage.getItem('token')).toBeNull();
            expect(localStorage.getItem('tokenExpiresAt')).toBeNull();
            expect(router.navigateByUrl).toHaveBeenCalledWith('auth/login');
            expect(ended).toBe(1);

            tick(HOUR); // and the timer has stopped: nothing more happens
            expect(ended).toBe(1);
            expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
        }));

        it('warns five minutes before, and not earlier', fakeAsync(() => {
            const warnings: (number | null)[] = [];
            service.sessionWarning$.subscribe((v) => warnings.push(v));
            login(30 * MIN);

            tick(24 * MIN);
            expect(warnings.every((w) => w === null)).toBeTrue();

            tick(2 * MIN); // 4 minutes left
            const last = warnings[warnings.length - 1];
            expect(last).not.toBeNull();
            expect(last).toBeLessThanOrEqual(5 * MIN);
            expect(last).toBeGreaterThan(3 * MIN);

            tick(10 * MIN);
            expect(localStorage.getItem('token')).toBeNull();
            expect(service.sessionWarning$.value).toBeNull(); // cleared by the logout
        }));

        it('a wrong computer clock does not matter: the server time decides', fakeAsync(() => {
            // this computer is 3 hours ahead of the server
            login(20 * MIN, 3 * HOUR);
            expect(Math.abs(service.msLeft() - 20 * MIN)).toBeLessThan(2000);

            tick(19 * MIN);
            expect(localStorage.getItem('token')).toBe('tok');
            tick(MIN + 15000);
            expect(localStorage.getItem('token')).toBeNull();
        }));

        it('a computer clock that is behind does not keep someone logged in late', fakeAsync(() => {
            login(20 * MIN, -3 * HOUR);
            tick(20 * MIN + 15000);
            expect(localStorage.getItem('token')).toBeNull();
        }));

        it('after a page reload startAutoLogout picks the countdown back up', fakeAsync(() => {
            localStorage.setItem('token', 'tok');
            localStorage.setItem('tokenExpiresAt', String(Date.now() + 10 * MIN));
            service.dispose();
            make(); // a fresh service, as after a reload
            service.startAutoLogout();
            tick(9 * MIN);
            expect(localStorage.getItem('token')).toBe('tok');
            tick(MIN + 15000);
            expect(localStorage.getItem('token')).toBeNull();
        }));

        it('reopening the page after 11 PM logs out straight away', fakeAsync(() => {
            let ended = 0;
            localStorage.setItem('token', 'tok');
            localStorage.setItem('tokenExpiresAt', String(Date.now() - 5 * MIN));
            service.dispose();
            make();
            service.sessionEnded$.subscribe(() => ended++);
            service.startAutoLogout();
            expect(localStorage.getItem('token')).toBeNull();
            expect(router.navigateByUrl).toHaveBeenCalledWith('auth/login');
            expect(ended).toBe(1);
        }));

        it('starting without a token does nothing and leaves no timer behind', fakeAsync(() => {
            service.startAutoLogout();
            tick(HOUR); // a leftover timer would make fakeAsync fail the test
            expect(router.navigateByUrl).not.toHaveBeenCalled();
        }));

        it('starting twice does not double up the timers or the logout', fakeAsync(() => {
            let ended = 0;
            service.sessionEnded$.subscribe(() => ended++);
            login(10 * MIN);
            service.startAutoLogout();
            service.startAutoLogout();
            tick(11 * MIN);
            expect(ended).toBe(1);
        }));

        it('logging in again later replaces the old countdown', fakeAsync(() => {
            login(5 * MIN);
            tick(2 * MIN);
            login(60 * MIN); // new login with a fresh session
            tick(30 * MIN);
            expect(localStorage.getItem('token')).toBe('tok');
            discardPeriodicTasks();
        }));

        it('checks as soon as the tab wakes up (a sleeping computer pauses timers)', fakeAsync(() => {
            const wake = makeCapturingListener();
            login(60 * MIN);
            localStorage.setItem('tokenExpiresAt', String(Date.now() - MIN)); // time passed while asleep
            spyOnProperty(document, 'hidden', 'get').and.returnValue(false);
            wake();
            expect(localStorage.getItem('token')).toBeNull();
            expect(router.navigateByUrl).toHaveBeenCalledWith('auth/login');
        }));
    });

    describe('a hidden tab', () => {
        it('is checked when it becomes visible again, not while it stays hidden', fakeAsync(() => {
            const wake = makeCapturingListener();
            service.setSession({
                accessToken: 'tok',
                expiresAt: iso(Date.now() + 60 * MIN),
                serverTime: iso(Date.now()),
            });
            localStorage.setItem('tokenExpiresAt', String(Date.now() - MIN));
            const hidden = spyOnProperty(document, 'hidden', 'get').and.returnValue(true);
            wake();
            expect(localStorage.getItem('token')).toBe('tok'); // still hidden: no reaction
            hidden.and.returnValue(false);
            wake();
            expect(localStorage.getItem('token')).toBeNull();
        }));
    });

    describe('logout', () => {
        it('clears the session, stops the timer and goes to the login page', fakeAsync(() => {
            service.setSession({
                accessToken: 'tok',
                expiresAt: iso(Date.now() + HOUR),
                serverTime: iso(Date.now()),
            });
            service.logout();
            expect(localStorage.getItem('token')).toBeNull();
            expect(localStorage.getItem('tokenExpiresAt')).toBeNull();
            expect(localStorage.getItem('serverSkewMs')).toBeNull();
            expect(router.navigateByUrl).toHaveBeenCalledWith('auth/login');
            tick(2 * HOUR); // no timer left running
            expect(router.navigateByUrl).toHaveBeenCalledTimes(1);
        }));

        it('a manual logout is not announced as an automatic one', fakeAsync(() => {
            let ended = 0;
            service.sessionEnded$.subscribe(() => ended++);
            service.setSession({ accessToken: 'tok', expiresAt: iso(Date.now() + HOUR) });
            service.logout();
            tick(2 * HOUR);
            expect(ended).toBe(0);
        }));
    });

    it('getRole reads the stored role', () => {
        localStorage.setItem('role', 'admin');
        expect(service.getRole()).toBe('admin');
    });
});
