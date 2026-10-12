import { inject } from "@angular/core";
import { AuthService } from "./AuthService";
import { CanActivateFn, Router } from "@angular/router";

export const AuthGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: {
      error: 'Você precisa entrar para acessar esta página.',
      returnUrl: state.url
    }
  });
};
