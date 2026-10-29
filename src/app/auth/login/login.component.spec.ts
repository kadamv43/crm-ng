import { fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
    let api: any;
    let auth: any;
    let toast: any;
    let router: any;
    let component: LoginComponent;

    const reply = {
        accessToken: 'tok',
        expiresAt: '2025-03-10T17:30:00.000Z',
        serverTime: '2025-03-10T04:30:00.000Z',
    };

    beforeEach(() => {
        localStorage.clear();
        api = {
            login: jasmine.createSpy('login').and.returnValue(of(reply)),
            getAuthUserDetails: jasmine
                .createSpy('details')
                .and.returnValue(of({ mobile: '9', role: 'admin', userId: 'U1', branch: { _id: 'B1' } })),
            getAppConfig: jasmine.createSpy('config').and.returnValue(of({ a: 1 })),
        };
        auth = { setSession: jasmine.createSpy('setSession') };
        toast = jasmine.createSpyObj('MessageService', ['add', 'clear']);
        router = jasmine.createSpyObj('Router', ['navigateByUrl']);
        component = new LoginComponent({} as any, new FormBuilder(), api, toast, router, auth);
        component.loginForm.patchValue({ username: 'asha', password: 'pw' });
    });

    afterEach(() => localStorage.clear());

    it('hands the whole login reply to the auth service so it can log out at 11 PM', fakeAsync(() => {
        component.login();
        expect(auth.setSession).toHaveBeenCalledOnceWith(reply);
        tick(2000);
    }));

    it('keeps the session before asking for the user details (they need the token)', fakeAsync(() => {
        const order: string[] = [];
        auth.setSession.and.callFake(() => order.push('session'));
        api.getAuthUserDetails.and.callFake(() => {
            order.push('details');
            return of({ role: 'admin', userId: 'U1', branch: {} });
        });
        component.login();
        expect(order).toEqual(['session', 'details']);
        tick(2000);
    }));

    it('stores the user details and goes to the dashboard', fakeAsync(() => {
        component.login();
        expect(localStorage.getItem('role')).toBe('admin');
        expect(localStorage.getItem('userId')).toBe('U1');
        expect(JSON.parse(localStorage.getItem('branch'))).toEqual({ _id: 'B1' });
        expect(router.navigateByUrl).not.toHaveBeenCalled();
        tick(2000);
        expect(router.navigateByUrl).toHaveBeenCalledWith('/');
        expect(component.loading).toBeFalse();
    }));

    it('does nothing with an empty form', () => {
        component.loginForm.patchValue({ username: '', password: '' });
        component.login();
        expect(api.login).not.toHaveBeenCalled();
        expect(auth.setSession).not.toHaveBeenCalled();
    });

    it('wrong credentials: no session, a clear message', fakeAsync(() => {
        api.login.and.returnValue(throwError(() => ({ status: 401 })));
        component.login();
        expect(auth.setSession).not.toHaveBeenCalled();
        expect(toast.add.calls.mostRecent().args[0].detail).toBe('Invalid Credentials');
        expect(component.loading).toBeFalse();
        tick(3000);
    }));

    it('an inactive or expired company: no session, shows the server message', () => {
        api.login.and.returnValue(
            throwError(() => ({ status: 403, error: { message: 'Your account is expired' } }))
        );
        component.login();
        expect(auth.setSession).not.toHaveBeenCalled();
        expect(toast.add.calls.mostRecent().args[0].detail).toBe('Your account is expired');
    });
});
