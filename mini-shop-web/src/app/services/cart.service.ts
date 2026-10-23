import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  categoryId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly storageKey = 'mini_shop_cart';
  private cartItemsSignal = signal<CartItem[]>([]);

  // Public readonly signals for components to consume
  readonly cartItems = this.cartItemsSignal.asReadonly();
  readonly itemCount = computed(() => this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0));
  readonly totalAmount = computed(() => this.cartItemsSignal().reduce((sum, item) => sum + item.price * item.quantity, 0));

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.cartItemsSignal.set(JSON.parse(stored));
      }
    } catch {
      this.cartItemsSignal.set([]);
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.cartItemsSignal()));
  }

  getCartItems(): CartItem[] {
    return this.cartItemsSignal();
  }

  addItem(item: Omit<CartItem, 'quantity'>, quantity: number = 1): void {
    this.cartItemsSignal.update(items => {
      const existingIndex = items.findIndex(i => i.productId === item.productId);
      if (existingIndex >= 0) {
        const updated = [...items];
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + quantity };
        return updated;
      }
      return [...items, { ...item, quantity }];
    });
    this.saveToStorage();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this.cartItemsSignal.update(items =>
      items.map(item => item.productId === productId ? { ...item, quantity } : item)
    );
    this.saveToStorage();
  }

  removeItem(productId: number): void {
    this.cartItemsSignal.update(items => items.filter(item => item.productId !== productId));
    this.saveToStorage();
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
    this.saveToStorage();
  }
}