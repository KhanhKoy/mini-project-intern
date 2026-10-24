import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);

  // Signals for reactive state
  cartItems = signal<CartItem[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed values
  subtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  totalItems = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  shippingFee = signal(0); // Fixed shipping fee

  total = computed(() => this.subtotal() + this.shippingFee());

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.error.set(null);

    // In a real app, this would come from a service/API
    // For now, we'll simulate loading
    setTimeout(() => {
      this.cartItems.set(this.cartService.getCartItems());
      this.loading.set(false);
    }, 300);
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }
    this.cartService.updateQuantity(item.productId, newQuantity);
    this.cartItems.set(this.cartService.getCartItems());
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.productId);
    this.cartItems.set(this.cartService.getCartItems());
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.cartItems.set([]);
  }

  trackByProductId(index: number, item: CartItem): number {
    return item.productId;
  }
}