import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from './product.service';

// Backend returns camelCase: orderDate, totalAmount, orderItems, fullName, shippingAddress, phoneNumber
export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  product?: Product; // Nested product object for display
}

export interface Order {
  id: number;
  userId?: number;
  orderItems: OrderItem[];
  totalAmount: number;
  orderDate: string; // ISO date string from backend
  fullName: string;
  shippingAddress: string;
  phoneNumber: string;
  status?: string; // Status from backend: pending, processing, shipped, delivered, cancelled
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:5101/api/Orders';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  // New endpoint: GET /api/orders/user/{userId}
  getOrdersByUser(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  // Payload matches CreateOrderDto on backend
  createOrder(order: {
    userId: number;
    fullName: string;
    shippingAddress: string;
    phoneNumber: string;
    items: { productId: number; quantity: number }[];
  }): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  cancelOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}