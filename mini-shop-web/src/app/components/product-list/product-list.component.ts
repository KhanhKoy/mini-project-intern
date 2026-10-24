import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product, Category } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals for reactive state
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
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
    this.loadCategories();

    // Subscribe to queryParams to get categoryId from URL
    this.route.queryParams.subscribe(params => {
      const categoryId = params['categoryId'] ? Number(params['categoryId']) : null;
      if (categoryId !== null) {
        this.selectedCategoryId.set(categoryId);
      } else {
        this.selectedCategoryId.set(null);
      }
    });
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

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId.set(categoryId);
    // Update URL query params without reloading
    if (categoryId !== null) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { categoryId },
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { categoryId: null },
        queryParamsHandling: 'merge'
      });
    }
  }

  clearFilter(): void {
    this.onCategoryChange(null);
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  trackByCategoryId(index: number, category: Category): number {
    return category.id;
  }
}