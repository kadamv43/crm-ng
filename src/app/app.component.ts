import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService, PrimeNGConfig } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [MessageService],
})
export class AppComponent implements OnInit, OnDestroy {
    private subs = new Subscription();
    private warningShown = false;

    constructor(
        private primengConfig: PrimeNGConfig,
        private authService: AuthService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.primengConfig.ripple = true;

        this.subs.add(
            this.authService.sessionWarning$.subscribe((msLeft) => {
                if (msLeft === null) {
                    this.warningShown = false;
                    this.messageService.clear('session');
                } else if (!this.warningShown) {
                    this.warningShown = true;
                    this.messageService.add({
                        key: 'session',
                        severity: 'warn',
                        summary: 'You will be logged out soon',
                        detail: 'For security everyone is logged out at 11:00 PM. Please save your work.',
                        sticky: true,
                    });
                }
            })
        );

        this.subs.add(
            this.authService.sessionEnded$.subscribe(() => {
                this.warningShown = false;
                this.messageService.clear('session');
                this.messageService.add({
                    key: 'session',
                    severity: 'info',
                    summary: 'Logged out',
                    detail: 'You were logged out automatically at 11:00 PM. Please log in again.',
                    life: 15000,
                });
            })
        );

        // after a page reload the timer is gone: start watching again
        this.authService.startAutoLogout();
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
