import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  // Signals for reactive state
  product = signal<Product | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  addingToCart = signal(false);

  // Computed values
  hasImage = computed(() => this.product()?.imageUrl !== undefined && this.product()?.imageUrl !== null && this.product()!.imageUrl !== '');
  formattedPrice = computed(() => {
    const p = this.product();
    if (!p) return '';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price);
  });

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(): void {
    this.loading.set(true);
    this.error.set(null);

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : null;

    if (!id || isNaN(id)) {
      this.error.set('ID sản phẩm không hợp lệ.');
      this.loading.set(false);
      return;
    }

    this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.product.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.error.set('Không tìm thấy sản phẩm.');
        } else {
          this.error.set('Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.');
        }
        this.loading.set(false);
        console.error('Error loading product:', err);
      }
    });
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;

    this.addingToCart.set(true);

    // Create CartItem from Product
    const cartItem: Omit<CartItem, 'quantity'> = {
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId
    };

    // Add to cart with quantity = 1
    this.cartService.addItem(cartItem, 1);

    // Show success feedback
    setTimeout(() => {
      this.addingToCart.set(false);
      alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    }, 300);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}