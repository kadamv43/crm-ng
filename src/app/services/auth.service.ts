import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

// Everyone is logged out automatically at 11 PM India time. The server decides
// when (the login reply carries the moment the token stops working); the
// browser only watches the clock and logs the screen out on time, so people see
// a clear message instead of a sudden error.
const WARN_BEFORE_MS = 5 * 60 * 1000;
const CHECK_EVERY_MS = 15 * 1000;

export interface LoginReply {
    accessToken: string;
    expiresAt?: string; // when the token stops working (ISO)
    serverTime?: string; // the server's clock at login (ISO)
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private timer: any = null;

    /** Milliseconds left once the logout is close (5 min), otherwise null. */
    readonly sessionWarning$ = new BehaviorSubject<number | null>(null);

    /** Fires when the session was ended automatically. */
    readonly sessionEnded$ = new Subject<void>();

    // A sleeping laptop pauses timers: check straight away when the tab wakes up.
    private onVisible = () => {
        if (!document.hidden) {
            this.check();
        }
    };

    constructor(private router: Router) {
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', this.onVisible);
        }
    }

    /** Stops the timer and the wake-up listener (used by tests). */
    dispose(): void {
        this.stopTimer();
        if (typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this.onVisible);
        }
    }

    /** Keeps the token and when it ends, and starts watching the clock. */
    setSession(reply: LoginReply): void {
        localStorage.setItem('token', reply.accessToken);

        const expiresAt = reply.expiresAt
            ? new Date(reply.expiresAt).getTime()
            : this.expiryFromToken(reply.accessToken);
        if (expiresAt) {
            localStorage.setItem('tokenExpiresAt', String(expiresAt));
        } else {
            localStorage.removeItem('tokenExpiresAt');
        }

        // How far this computer's clock is from the server's, so a wrong clock
        // cannot log someone out early or keep them in late.
        const serverTime = reply.serverTime
            ? new Date(reply.serverTime).getTime()
            : NaN;
        if (!isNaN(serverTime)) {
            localStorage.setItem('serverSkewMs', String(serverTime - Date.now()));
        } else {
            localStorage.removeItem('serverSkewMs');
        }

        this.startAutoLogout();
    }

    isLoggedIn(): boolean {
        if (!localStorage.getItem('token')) {
            return false;
        }
        const left = this.msLeft();
        return left === null || left > 0;
    }

    login(token: string): void {
        localStorage.setItem('token', token);
        this.router.navigate(['/']);
    }

    getRole() {
        return localStorage.getItem('role');
    }

    /** When the session ends (ms since 1970), or null if unknown. */
    getExpiresAt(): number | null {
        const stored = Number(localStorage.getItem('tokenExpiresAt'));
        if (stored) {
            return stored;
        }
        return this.expiryFromToken(localStorage.getItem('token'));
    }

    /** Milliseconds until the automatic logout, or null if unknown. */
    msLeft(): number | null {
        const expiresAt = this.getExpiresAt();
        return expiresAt === null ? null : expiresAt - this.serverNow();
    }

    /** Start (or restart) watching the clock. Safe to call on every page load. */
    startAutoLogout(): void {
        this.stopTimer();
        if (!localStorage.getItem('token')) {
            return;
        }
        this.check();
        if (localStorage.getItem('token')) {
            this.timer = setInterval(() => this.check(), CHECK_EVERY_MS);
        }
    }

    logout(): void {
        this.stopTimer();
        this.sessionWarning$.next(null);
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiresAt');
        localStorage.removeItem('serverSkewMs');
        this.router.navigateByUrl('auth/login');
    }

    private check(): void {
        if (!localStorage.getItem('token')) {
            this.stopTimer();
            return;
        }
        const left = this.msLeft();
        if (left === null) {
            return; // no way to know when it ends; the server will say with a 401
        }
        if (left <= 0) {
            this.logout();
            this.sessionEnded$.next();
        } else if (left <= WARN_BEFORE_MS) {
            this.sessionWarning$.next(left);
        } else if (this.sessionWarning$.value !== null) {
            this.sessionWarning$.next(null);
        }
    }

    private stopTimer(): void {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private serverNow(): number {
        const skew = Number(localStorage.getItem('serverSkewMs'));
        return Date.now() + (isNaN(skew) ? 0 : skew);
    }

    // Fallback for a login reply without expiresAt: read "exp" from the token.
    private expiryFromToken(token: string | null): number | null {
        try {
            const payload = token?.split('.')[1];
            if (!payload) {
                return null;
            }
            const json = JSON.parse(
                atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
            );
            return json?.exp ? json.exp * 1000 : null;
        } catch {
            return null;
        }
    }
}
