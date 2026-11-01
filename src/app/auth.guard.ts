import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
} from '@angular/router';
import { AuthService } from './services/auth.service';


@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        if (this.authService.isLoggedIn()) {
            const allowedRoles = next.data['roles'] as string[] | undefined;
            const role = this.authService.getRole();
            if (allowedRoles && (!role || !allowedRoles.includes(role))) {
                this.router.navigate(['/']);
                return false;
            }
            return true;
        } else {
            this.router.navigate(['/auth/login']); // Redirect to login if not authenticated
            return false;
        }
    }
}
