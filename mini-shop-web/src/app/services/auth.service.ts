import { Injectable, signal, computed, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from './cart.service';

export interface LoginRequest {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5101/api/Auth';

  // Signals for reactive state management
  private readonly _currentUser = signal<User | null>(null);
  private readonly _isLoggedIn = signal<boolean>(false);

  // Public computed signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cartService: CartService  // Inject CartService in constructor
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // On server, keep default unauthenticated state
      return;
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this._currentUser.set(user);
        this._isLoggedIn.set(true);
      } catch {
        this.clearAuthData();
      }
    }
  }

  private clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this._currentUser.set(null);
    this._isLoggedIn.set(false);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.token && response.user) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
          }
          this._currentUser.set(response.user);
          this._isLoggedIn.set(true);
        }
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    // Clear cart data to prevent new user seeing old user's cart
    this.cartService.clearCart();

    this.clearAuthData();
    this.router.navigate(['/products']);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this._currentUser();
  }
}