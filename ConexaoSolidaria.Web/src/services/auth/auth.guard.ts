import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CanActivateFn, Router } from '@angular/router';

export const authenticationGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: {
      error: 'You must sign in to access this page.',
      returnUrl: state.url,
    },
  });
};

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRole = route.data['role'];

  if (typeof requiredRole === 'number' && authService.hasRole(requiredRole)) {
    return true;
  }

  return router.createUrlTree(['/'], {
    queryParams: { accessDenied: '1' },
  });
};
