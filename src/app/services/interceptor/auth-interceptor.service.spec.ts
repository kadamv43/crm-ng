import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';

import { AuthInterceptorService } from './auth-interceptor.service';
import { AuthService } from '../auth.service';

describe('AuthInterceptorService', () => {
    let http: HttpClient;
    let ctrl: HttpTestingController;
    let auth: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
        localStorage.clear();
        auth = jasmine.createSpyObj('AuthService', ['logout']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: AuthService, useValue: auth },
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AuthInterceptorService,
                    multi: true,
                },
            ],
        });
        http = TestBed.inject(HttpClient);
        ctrl = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        ctrl.verify();
        localStorage.clear();
    });

    it('sends the token with every request', () => {
        localStorage.setItem('token', 'abc');
        http.get('/x').subscribe();
        const req = ctrl.expectOne('/x');
        expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
        req.flush({});
    });

    it('does not add a header without a token', () => {
        http.get('/x').subscribe();
        const req = ctrl.expectOne('/x');
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush({});
    });

    it('does not touch the login request', () => {
        localStorage.setItem('token', 'abc');
        http.post('/auth/login', {}).subscribe();
        const req = ctrl.expectOne('/auth/login');
        expect(req.request.headers.has('Authorization')).toBeFalse();
        req.flush({});
    });

    it('a 401 (the session ended, e.g. the 11 PM logout) clears the session and passes the error on', () => {
        localStorage.setItem('token', 'abc');
        let status = 0;
        http.get('/x').subscribe({ error: (e) => (status = e.status) });
        ctrl.expectOne('/x').flush({}, { status: 401, statusText: 'Unauthorized' });
        expect(auth.logout).toHaveBeenCalledTimes(1);
        expect(status).toBe(401);
    });

    it('other errors do not log anyone out', () => {
        localStorage.setItem('token', 'abc');
        for (const code of [400, 403, 404, 500]) {
            http.get('/x').subscribe({ error: () => undefined });
            ctrl.expectOne('/x').flush({}, { status: code, statusText: 'err' });
        }
        expect(auth.logout).not.toHaveBeenCalled();
    });

    it('a wrong-password 401 on the login page does not log out (there is no session yet)', () => {
        localStorage.setItem('token', 'abc');
        http.post('/auth/login', {}).subscribe({ error: () => undefined });
        ctrl.expectOne('/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });
        expect(auth.logout).not.toHaveBeenCalled();
    });
});
