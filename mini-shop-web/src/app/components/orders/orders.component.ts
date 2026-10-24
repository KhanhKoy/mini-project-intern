import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Signals for reactive state
  orders = signal<Order[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    // Get current user from AuthService signal
    const currentUser = this.authService.currentUser();

    // If user not logged in, redirect to login
    if (!currentUser) {
      this.error.set('Vui lòng đăng nhập để xem lịch sử đơn hàng.');
      this.loading.set(false);
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/orders' } });
      return;
    }

    const userId = currentUser.id;
    this.loading.set(true);
    this.error.set(null);

    // Call new API endpoint: GET /api/orders/user/{userId}
    this.orderService.getOrdersByUser(userId).subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.');
        this.loading.set(false);
        console.error('Error loading orders:', err);
      }
    });
  }

  // Backend now returns status field - use it
  getStatusClass(order: Order): string {
    const status = (order as any).status || 'pending';
    const statusClasses: Record<string, string> = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-unknown';
  }

  getStatusLabel(order: Order): string {
    const status = (order as any).status || 'pending';
    const statusLabels: Record<string, string> = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đã gửi hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statusLabels[status] || status;
  }

  trackByOrderId(index: number, order: Order): number {
    return order.id;
  }

  // Use order.orderDate (string) instead of order.createdAt (Date)
  formatOrderDate(orderDate: string): string {
    return new Date(orderDate).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  cancelOrder(orderId: number): void {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      console.log('Cancel order:', orderId);
      // TODO: Call actual API
      // this.orderService.cancelOrder(orderId).subscribe({
      //   next: () => this.loadOrders(),
      //   error: (err) => console.error('Cancel order failed:', err)
      // });
    }
  }
}