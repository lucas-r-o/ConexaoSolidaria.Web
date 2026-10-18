import '@angular/compiler';
import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService, UserRole } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService role access', () => {
  let authService: AuthService;
  let httpPost: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    httpPost = vi.fn().mockReturnValue(of('jwt-token'));
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: HttpClient, useValue: { post: httpPost } }],
    });
    authService = TestBed.inject(AuthService);
  });

  it('matches API role claims to the internal role values', () => {
    const getPayload = vi.spyOn(authService, 'getJwtPayload');

    getPayload.mockReturnValue({ role: 'Doador' });
    expect(authService.hasRole(UserRole.Donor)).toBe(true);

    getPayload.mockReturnValue({ role: 'GestorOng' });
    expect(authService.hasRole(UserRole.Donor)).toBe(false);
  });

  it('recognizes organization managers and rejects an unknown role', () => {
    const getPayload = vi.spyOn(authService, 'getJwtPayload');

    getPayload.mockReturnValue({ role: 'gestorong' });
    expect(authService.hasRole(UserRole.OrganizationManager)).toBe(true);

    getPayload.mockReturnValue({ role: 'OrganizationManager' });
    expect(authService.hasRole(UserRole.OrganizationManager)).toBe(true);

    getPayload.mockReturnValue({ role: '1' });
    expect(authService.hasRole(UserRole.OrganizationManager)).toBe(false);
  });

  it('recognizes the English donor claim returned by the login API', () => {
    vi.spyOn(authService, 'getJwtPayload').mockReturnValue({ role: 'Donor' });

    expect(authService.hasRole(UserRole.Donor)).toBe(true);
  });

  it('uses the existing API login endpoint and request fields', async () => {
    const credentials = { email: 'person@example.com', password: 'Example-password1!' };

    await expect(firstValueFrom(authService.login(credentials))).resolves.toBe('jwt-token');
    expect(httpPost).toHaveBeenCalledWith(`${environment.apiUrl}/auth/login`, credentials, {
      responseType: 'text',
    });
  });
});
