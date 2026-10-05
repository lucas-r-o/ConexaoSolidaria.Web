import { inject } from "@angular/core";
import { AuthService } from "./AuthService";
import { CanActivateFn, Router } from "@angular/router";

export const AuthGuard : CanActivateFn = () => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isloggedIn())
    return true;

  return router.createUrlTree(['/login'], {
    queryParams: {
      error: 'You need to be logged in.'
    }
  });
}
