import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthResponse, ChangePasswordRequest, ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, Usuario, ValidateOtpRequest } from '../models/models';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = environment.apiUrl;
  private readonly loginPath = environment.endpoints.login;
  private readonly registerPath = environment.endpoints.register;

  // Signal para el usuario actual
  currentUser = signal<Usuario | null>(null);

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  login(email: string, password: string) {
    const body: LoginRequest = { email, password };
    return this.http.post<AuthResponse>(`${this.base}${this.loginPath}`, body).pipe(
      tap((res) => {
        this.saveToken(res.token);
        this.loadUserFromToken();
      })
    );
  }

  register(data: RegisterRequest) {
    return this.http.post<Usuario>(`${this.base}${this.registerPath}`, data);
  }

  forgotPassword(email: string) {
    const body: ForgotPasswordRequest = { email };
    return this.http.post(`${this.base}/api/auth/forgot-password`, body);
  }

  validateOtp(email: string, otp: string) {
    const body: ValidateOtpRequest = { email, otp };
    return this.http.post(`${this.base}/api/auth/validate-otp`, body);
  }

  resetPassword(request: ResetPasswordRequest) {
    return this.http.post(`${this.base}/api/auth/reset-password`, request);
  }

  changePassword(request: ChangePasswordRequest) {
    return this.http.post(`${this.base}/api/auth/change-password`, request);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired
    try {
      const payload = this.decodeToken(token);
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        if (expDate < new Date()) {
          this.logout();
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user?.rol === 'ADMIN';
  }

  getUserId(): string | null {
    return this.currentUser()?.id || null;
  }

  /**
   * Decodifica el payload del JWT para obtener info del usuario.
   * JWT Payload structure from backend:
   * {
   *   "id": "uuid-string",
   *   "cedula_profesional": "ADMIN-001",
   *   "rol": "admin" | "usuario",
   *   "sub": "email@domain.com",
   *   "iat": timestamp,
   *   "exp": timestamp
   * }
   */
  private loadUserFromToken() {
    const token = this.getToken();
    if (!token) {
      this.currentUser.set(null);
      return;
    }

    try {
      const payload = this.decodeToken(token);

      // Map JWT payload to Usuario interface
      // Note: rol comes as lowercase from backend, convert to uppercase for consistency
      const rolUppercase = (payload.rol || 'usuario').toUpperCase();

      this.currentUser.set({
        id: payload.id || payload.sub || '',
        nombreCompleto: payload.nombre || payload.nombreCompleto || payload.sub?.split('@')[0] || 'Usuario',
        cedulaProfesional: payload.cedula_profesional || payload.cedulaProfesional || '',
        especialidad: payload.especialidad || '',
        email: payload.sub || payload.email || '',
        rol: rolUppercase === 'ADMIN' ? 'ADMIN' : 'USUARIO',
        activo: true,
      });
    } catch (e) {
      console.error('Error decoding token:', e);
      this.currentUser.set(null);
    }
  }

  /**
   * Decode JWT token payload (base64)
   */
  private decodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Decode base64url to base64
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');

    // Pad with '=' if needed
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }

    const decoded = atob(base64);
    return JSON.parse(decoded);
  }
}
