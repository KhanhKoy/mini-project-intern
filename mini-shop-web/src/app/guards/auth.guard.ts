import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During SSR, allow access (will be checked on client side)
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirect to login with return URL
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};