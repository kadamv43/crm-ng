import { BehaviorSubject, Subject } from 'rxjs';
import { AppComponent } from './app.component';

describe('AppComponent session messages', () => {
    let warning$: BehaviorSubject<number | null>;
    let ended$: Subject<void>;
    let auth: any;
    let messages: jasmine.SpyObj<any>;
    let component: AppComponent;

    beforeEach(() => {
        warning$ = new BehaviorSubject<number | null>(null);
        ended$ = new Subject<void>();
        auth = {
            sessionWarning$: warning$,
            sessionEnded$: ended$,
            startAutoLogout: jasmine.createSpy('startAutoLogout'),
        };
        messages = jasmine.createSpyObj('MessageService', ['add', 'clear']);
        component = new AppComponent({ ripple: false } as any, auth, messages);
        component.ngOnInit();
        messages.add.calls.reset();
        messages.clear.calls.reset();
    });

    afterEach(() => component.ngOnDestroy());

    it('starts watching the clock when the app opens (after a page reload)', () => {
        const fresh = new AppComponent({ ripple: false } as any, auth, messages);
        fresh.ngOnInit();
        expect(auth.startAutoLogout).toHaveBeenCalled();
        fresh.ngOnDestroy();
    });

    it('shows the 11 PM warning once, however many times it is told', () => {
        warning$.next(4 * 60 * 1000);
        warning$.next(3 * 60 * 1000);
        warning$.next(2 * 60 * 1000);
        expect(messages.add).toHaveBeenCalledTimes(1);
        const msg = messages.add.calls.mostRecent().args[0];
        expect(msg.severity).toBe('warn');
        expect(msg.sticky).toBeTrue();
        expect(msg.detail).toContain('11:00 PM');
    });

    it('takes the warning away when it no longer applies, and can show it again', () => {
        warning$.next(4 * 60 * 1000);
        warning$.next(null);
        expect(messages.clear).toHaveBeenCalledWith('session');
        warning$.next(4 * 60 * 1000);
        expect(messages.add).toHaveBeenCalledTimes(2);
    });

    it('says clearly that the logout was automatic', () => {
        ended$.next();
        expect(messages.clear).toHaveBeenCalledWith('session');
        const msg = messages.add.calls.mostRecent().args[0];
        expect(msg.severity).toBe('info');
        expect(msg.summary).toBe('Logged out');
        expect(msg.detail).toContain('automatically');
        expect(msg.detail).toContain('log in again');
    });

    it('stops listening when destroyed', () => {
        component.ngOnDestroy();
        warning$.next(1000);
        ended$.next();
        expect(messages.add).not.toHaveBeenCalled();
    });
});
