import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard that only allows ADMIN users to access the route
 */
export const adminGuard: CanActivateFn = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
        router.navigate(['/login']);
        return false;
    }

    if (!auth.isAdmin()) {
        router.navigate(['/dashboard']);
        return false;
    }

    return true;
};
