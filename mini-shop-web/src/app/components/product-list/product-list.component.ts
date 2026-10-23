import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);

  // Signals for reactive state
  products = signal<Product[]>([]);
  categories = signal<{ id: number; name: string }[]>([]);
  selectedCategoryId = signal<number | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Computed: filtered products based on selected category
  filteredProducts = computed(() => {
    const catId = this.selectedCategoryId();
    if (catId === null) return this.products();
    return this.products().filter(p => p.categoryId === catId);
  });

  ngOnInit(): void {
    this.loadProducts();
    this.extractCategories();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
        this.loading.set(false);
        console.error('Error loading products:', err);
      }
    });
  }

  extractCategories(): void {
    // Extract unique categories from products
    const cats = new Map<number, string>();
    this.products().forEach(p => {
      if (p.categoryId && !cats.has(p.categoryId)) {
        cats.set(p.categoryId, `Danh mục ${p.categoryId}`); // Will be improved if we have category names
      }
    });
    this.categories.set(Array.from(cats.entries()).map(([id, name]) => ({ id, name })));
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
  }

  clearFilter(): void {
    this.selectedCategoryId.set(null);
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}