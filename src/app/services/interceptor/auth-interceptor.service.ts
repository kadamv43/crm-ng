import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpResponse,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Injectable({
    providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('token');

        if (req.url.includes('/login')) {
            return next.handle(req);
        }

        if (token) {
            const clonedReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return next.handle(clonedReq).pipe(
                tap((event) => {
                    if (event instanceof HttpResponse) {
                        // Optionally handle successful responses here
                    }
                }),
                catchError((error: HttpErrorResponse) => {
                    if (error.status === 401) {
                        // The token is no longer valid (e.g. the 11 PM logout):
                        // clear it and go to the login page
                        this.authService.logout();
                    }
                    return throwError(error);
                })
            );
        }

        return next.handle(req);
    }
}
