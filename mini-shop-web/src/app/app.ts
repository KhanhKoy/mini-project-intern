import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router'; // Thêm RouterLink và RouterLinkActive

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive], // Khai báo vào mảng imports
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('mini-shop-web');
}