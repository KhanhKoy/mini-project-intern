import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Form signals
  firstName = signal('');
  lastName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  agreeTerms = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Computed validation
  isFirstNameValid = computed(() => this.firstName().trim().length >= 2);
  isLastNameValid = computed(() => this.lastName().trim().length >= 2);
  isEmailValid = computed(() => {
    const email = this.email();
    return email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  });
  isPasswordValid = computed(() => this.password().length >= 8);
  isConfirmPasswordValid = computed(() => this.confirmPassword() === this.password() && this.confirmPassword().length > 0);
  isAgreeTermsValid = computed(() => this.agreeTerms());

  isFormValid = computed(() =>
    this.isFirstNameValid() &&
    this.isLastNameValid() &&
    this.isEmailValid() &&
    this.isPasswordValid() &&
    this.isConfirmPasswordValid() &&
    this.isAgreeTermsValid()
  );

  passwordStrength = computed(() => {
    const pwd = this.password();
    if (pwd.length === 0) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  });

  passwordStrengthLabel = computed(() => {
    const strength = this.passwordStrength();
    if (strength <= 1) return 'Rất yếu';
    if (strength === 2) return 'Yếu';
    if (strength === 3) return 'Trung bình';
    if (strength === 4) return 'Mạnh';
    return 'Rất mạnh';
  });

  passwordStrengthColor = computed(() => {
    const strength = this.passwordStrength();
    if (strength <= 1) return '#dc2626';
    if (strength === 2) return '#f97316';
    if (strength === 3) return '#eab308';
    if (strength === 4) return '#22c55e';
    return '#16a34a';
  });

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.error.set('Vui lòng điền đầy đủ thông tin hợp lệ và đồng ý điều khoản');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.authService.register({
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      email: this.email().trim().toLowerCase(),
      password: this.password()
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
        } else {
          this.error.set(response.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
        console.error('Register error:', err);
      }
    });
  }

  onGoogleRegister(): void {
    // TODO: Implement Google OAuth
    console.log('Google register clicked');
  }

  onFacebookRegister(): void {
    // TODO: Implement Facebook OAuth
    console.log('Facebook register clicked');
  }
}