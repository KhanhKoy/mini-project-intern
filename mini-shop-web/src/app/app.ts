import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('mini-shop-web');
  private readonly authService = inject(AuthService);

  // Expose auth service signals to template
  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly currentUser = this.authService.currentUser;

  // User menu dropdown state
  isUserMenuOpen = signal(false);

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(open => !open);
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen.set(false);
  }
}