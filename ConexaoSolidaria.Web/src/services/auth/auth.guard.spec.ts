import '@angular/compiler';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AuthService, UserRole } from './auth.service';
import { authenticationGuard, roleGuard } from './auth.guard';

describe('authenticationGuard', () => {
  it('allows a signed-in user to continue', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedIn: () => true } },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      authenticationGuard({} as ActivatedRouteSnapshot, { url: '/donate' } as RouterStateSnapshot),
    );

    expect(result).toBe(true);
  });

  it('redirects signed-out users to sign in and keeps their return URL', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedIn: () => false } },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      authenticationGuard(
        {} as ActivatedRouteSnapshot,
        { url: '/donate?campaign=123' } as RouterStateSnapshot,
      ),
    );

    expect(result).toBeInstanceOf(UrlTree);
    if (result instanceof UrlTree) {
      const router = TestBed.inject(Router);
      expect(router.serializeUrl(result)).toContain('/login?');
      expect(router.serializeUrl(result)).toContain('returnUrl=%2Fdonate%3Fcampaign%3D123');
    }
  });
});

describe('roleGuard', () => {
  it('allows access when the signed-in user has the required role', () => {
    const hasRole = vi.fn((role: UserRole) => role === UserRole.Donor);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { hasRole } }],
    });

    const route = new ActivatedRouteSnapshot();
    route.data = { role: UserRole.Donor };
    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));

    expect(result).toBe(true);
    expect(hasRole).toHaveBeenCalledWith(UserRole.Donor);
  });

  it('redirects users without the required role to the home page', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { hasRole: () => false } }],
    });

    const route = new ActivatedRouteSnapshot();
    route.data = { role: UserRole.OrganizationManager };
    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as RouterStateSnapshot));

    expect(result).toBeInstanceOf(UrlTree);
    if (result instanceof UrlTree) {
      const router = TestBed.inject(Router);
      expect(router.serializeUrl(result)).toBe('/?accessDenied=1');
    }
  });
});
