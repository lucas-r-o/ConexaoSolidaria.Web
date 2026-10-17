import '@angular/compiler';
import { describe, expect, it, vi } from 'vitest';
import { AuthService, UserRole } from './AuthService';

describe('AuthService role access', () => {
  it('matches the role claim to the enum name written by the API', () => {
    const authService = new AuthService();
    const getPayload = vi.spyOn(authService, 'getTokenPayload');

    getPayload.mockReturnValue({ role: 'Doador' });
    expect(authService.hasRole(UserRole.Doador)).toBe(true);

    getPayload.mockReturnValue({ role: 'GestorOng' });
    expect(authService.hasRole(UserRole.Doador)).toBe(false);
  });

  it('recognizes GestorOng and rejects an unknown role', () => {
    const authService = new AuthService();
    const getPayload = vi.spyOn(authService, 'getTokenPayload');

    getPayload.mockReturnValue({ role: 'gestorong' });
    expect(authService.hasRole(UserRole.GestorOng)).toBe(true);

    getPayload.mockReturnValue({ role: '1' });
    expect(authService.hasRole(UserRole.GestorOng)).toBe(false);
  });
});
