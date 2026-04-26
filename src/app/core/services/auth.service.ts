import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface LoginResult {
  token: string;
  role: string;
  permissions: string[];
}

interface LoginApiPayload {
  token?: string;
  accessToken?: string;
  jwt?: string;
  access_token?: string;
  role?: string;
  userRole?: string;
  permissions?: string[];
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = 'http://localhost:8082';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }): Observable<LoginResult> {
    const body = {
      email: credentials.email,
      password: credentials.password
    };
    console.log('=== BODY ENVOYÉ ===', body);
    return this.http
      .post<LoginApiPayload>(`${this.baseUrl}/auth/login`, body)
      .pipe(
        map((raw: LoginApiPayload) => {
          console.log('=== REPONSE BACKEND ===', raw);
          return this.normalizeLoginResponse(raw);
        })
      );
  }

  private normalizeLoginResponse(raw: LoginApiPayload): LoginResult {
    const rawData = raw['data'];
    const nested =
      rawData && typeof rawData === 'object' && !Array.isArray(rawData)
        ? (rawData as LoginApiPayload)
        : null;
    const merged: LoginApiPayload = nested ? { ...nested, ...raw } : raw;

    const token =
      (typeof merged.token === 'string' && merged.token) ||
      (typeof merged.accessToken === 'string' && merged.accessToken) ||
      (typeof merged.jwt === 'string' && merged.jwt) ||
      (typeof merged.access_token === 'string' && merged.access_token) ||
      '';

    const role =
      (typeof merged.role === 'string' && merged.role) ||
      (typeof merged.userRole === 'string' && merged.userRole) ||
      '';

    const perms = merged.permissions;
    const permissions = Array.isArray(perms)
      ? perms.filter((p): p is string => typeof p === 'string')
      : [];

    console.log('=== LOGIN RESULT ===', { token, role, permissions });
    return { token, role, permissions };
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  saveRole(role: string): void {
    localStorage.setItem('role', role);
  }

  savePermissions(permissions: string[]): void {
    localStorage.setItem('permissions', JSON.stringify(permissions));
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getPermissions(): string[] {
    const p = localStorage.getItem('permissions');
    return p ? JSON.parse(p) : [];
  }

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((p) => this.hasPermission(p));
  }

  isAdminRole(): boolean {
    const r = (this.getRole() || '').toUpperCase();
    return r === 'ADMIN';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('permissions');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}