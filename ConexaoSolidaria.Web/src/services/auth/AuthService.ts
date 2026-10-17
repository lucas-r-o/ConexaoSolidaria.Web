import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

export enum UserRole {
  Doador = 0,
  GestorOng = 1,
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'token';

  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);

    return !!token;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getTokenPayload(): TokenPayload | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    try {
      return jwtDecode<TokenPayload>(token);
    } catch {
      return null;
    }
  }

  hasRole(role: UserRole): boolean {
    return this.getTokenPayload()?.role?.toLocaleUpperCase() === UserRole[role].toLocaleUpperCase();
  }

  getHeaderToken(): { Authorization: string } | undefined {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }

}

interface TokenPayload {
  nameid?: string;
  email?: string;
  role?: string;
  exp?: number;
}
