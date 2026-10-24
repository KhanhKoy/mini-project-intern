import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Form signals
  checkoutForm: FormGroup;
  isLoading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  // Cart data
  cartItems = this.cartService.cartItems;
  itemCount = this.cartService.itemCount;
  totalAmount = this.cartService.totalAmount;

  // Computed: check if cart is empty
  isCartEmpty = computed(() => this.itemCount() === 0);

  constructor() {
    this.checkoutForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      shippingAddress: ['', [Validators.required, Validators.maxLength(500)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[0-9+\-\s()]{10,}$/)]]
    });
  }

  ngOnInit(): void {
    // If cart is empty, redirect to cart page
    if (this.isCartEmpty()) {
      this.router.navigate(['/cart']);
    }
  }

  // Form validation getters
  get fullName() { return this.checkoutForm.get('fullName'); }
  get shippingAddress() { return this.checkoutForm.get('shippingAddress'); }
  get phoneNumber() { return this.checkoutForm.get('phoneNumber'); }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} là bắt buộc.`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} không được vượt quá ${field.errors['maxlength'].requiredLength} ký tự.`;
      if (field.errors['pattern']) return 'Số điện thoại không hợp lệ.';
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      fullName: 'Họ tên',
      shippingAddress: 'Địa chỉ giao hàng',
      phoneNumber: 'Số điện thoại'
    };
    return labels[fieldName] || fieldName;
  }

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.error.set('Vui lòng điền đầy đủ thông tin hợp lệ.');
      return;
    }

    if (this.isCartEmpty()) {
      this.error.set('Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error.set('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      this.isLoading.set(false);
      this.router.navigate(['/login']);
      return;
    }

    // Map form data and cart items to CreateOrderDto format
    const orderData = {
      userId: currentUser.id,
      fullName: this.fullName?.value.trim(),
      shippingAddress: this.shippingAddress?.value.trim(),
      phoneNumber: this.phoneNumber?.value.trim(),
      items: this.cartItems().map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    this.orderService.createOrder(orderData as any).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.success.set(true);
        // Clear cart after successful order
        this.cartService.clearCart();
        // Redirect to orders page after a short delay
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Đặt hàng thất bại. Vui lòng thử lại sau.');
        console.error('Order error:', err);
      }
    });
  }
}