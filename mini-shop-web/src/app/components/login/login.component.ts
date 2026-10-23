import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Form signals
  identifier = signal('');
  password = signal('');
  rememberMe = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed validation
  isIdentifierValid = computed(() => this.identifier().trim().length >= 3);

  isPasswordValid = computed(() => this.password().length >= 6);

  isFormValid = computed(() => this.isIdentifierValid() && this.isPasswordValid());

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.error.set('Vui lòng điền đầy đủ thông tin hợp lệ');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const credentials: LoginRequest = {
      identifier: this.identifier().trim(),
      password: this.password(),
      rememberMe: this.rememberMe()
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.router.navigate(['/']);
        } else {
          this.error.set(response.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        console.error('Login error:', err);
      }
    });
  }

  onGoogleLogin(): void {
    // TODO: Implement Google OAuth
    console.log('Google login clicked');
  }

  onFacebookLogin(): void {
    // TODO: Implement Facebook OAuth
    console.log('Facebook login clicked');
  }
}