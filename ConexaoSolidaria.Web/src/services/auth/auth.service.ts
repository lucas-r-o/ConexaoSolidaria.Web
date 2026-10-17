import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { LoginRequestDto } from '../users/login-request.dto';

export enum UserRole {
  Donor = 0,
  OrganizationManager = 1,
}

const API_ROLE_CLAIMS: Record<UserRole, string> = {
  [UserRole.Donor]: 'Doador',
  [UserRole.OrganizationManager]: 'GestorOng',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorageKey = 'token';

  login(credentials: LoginRequestDto): Observable<string> {
    return this.http.post(`${environment.apiUrl}/auth/login`, credentials, {
      responseType: 'text',
    });
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.tokenStorageKey);

    return !!token;
  }

  logout(): void {
    localStorage.removeItem(this.tokenStorageKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenStorageKey, token);
  }

  getJwtPayload(): JwtPayload | null {
    const token = localStorage.getItem(this.tokenStorageKey);
    if (!token) return null;

    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  hasRole(role: UserRole): boolean {
    return this.getJwtPayload()?.role?.toUpperCase() === API_ROLE_CLAIMS[role].toUpperCase();
  }

  getAuthorizationHeader(): { Authorization: string } | undefined {
    const token = localStorage.getItem(this.tokenStorageKey);
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}

interface JwtPayload {
  nameid?: string;
  email?: string;
  role?: string;
  exp?: number;
}
