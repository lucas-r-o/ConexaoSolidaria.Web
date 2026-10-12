import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

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

  getHeaderToken(): { Authorization: string } | undefined {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }

}

interface TokenPayload {
  unique_name?: string;
  email?: string;
  role?: string;
  exp?: number;
}
