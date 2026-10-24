import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Get platform ID to check if we're on browser
  const platformId = inject(PLATFORM_ID);

  // Only add auth header on browser platform
  if (!isPlatformBrowser(platformId)) {
    return next(request);
  }

  // Inject AuthService using inject() function
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  // Clone request and add Authorization header if token exists
  if (token) {
    const authRequest = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.status === 401) {
          authService.logout();
          router.navigate(['/login'], {
            queryParams: { returnUrl: router.url }
          });
        }
        return throwError(() => error);
      })
    );
  }

  // No token, proceed without auth header
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login'], {
          queryParams: { returnUrl: router.url }
        });
      }
      return throwError(() => error);
    })
  );
};