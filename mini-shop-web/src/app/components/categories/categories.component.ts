import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService, Category } from '../../services/product.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  private productService = inject(ProductService);

  // Signals for reactive state
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getCategories().subscribe({
      next: (data) => {
        this.categories.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
        this.loading.set(false);
        console.error('Error loading categories:', err);
      }
    });
  }

  trackByCategoryId(index: number, category: Category): number {
    return category.id;
  }
}