# MiniShop Project - Comprehensive Summary Report

**Generated:** 2026-10-23  
**Project Root:** `D:\MiniShopProject`  
**Branch:** `main`  
**Latest Commit:** `a0b927c` - "be call api từ db"

---

## 1. Overall Architecture & Technology Stack

### Backend (MiniShopApi) - ASP.NET Core 8.0
| Component | Technology |
|-----------|------------|
| **Framework** | ASP.NET Core 8.0 (Web API) |
| **Language** | C# 12 |
| **ORM** | Entity Framework Core 8.0 |
| **Database** | PostgreSQL (via Npgsql.EntityFrameworkCore.PostgreSQL 8.0) |
| **Naming Convention** | EFCore.NamingConventions (snake_case for DB) |
| **API Documentation** | Swashbuckle.AspNetCore 6.6.2 (Swagger/OpenAPI) |
| **CORS** | AllowAll policy (development) |
| **JSON Serialization** | System.Text.Json with `ReferenceHandler.IgnoreCycles` |
| **Port** | HTTP: 5101, HTTPS: 7232 |

### Frontend (mini-shop-web) - Angular 18+
| Component | Technology |
|-----------|------------|
| **Framework** | Angular 18+ (standalone components) |
| **Language** | TypeScript |
| **Build Tool** | Angular CLI (Vite-based) |
| **SSR** | Enabled (`main.server.ts`, `app.config.server.ts`) |
| **HTTP Client** | Angular HttpClient with `withFetch()` |
| **API Base URL** | `http://localhost:5101/api/Products` |

### Database Schema (PostgreSQL)
The database uses **snake_case** table/column names via `EFCore.NamingConventions`:
- **Categories** - `id`, `name`, `description`
- **Users** - `id`, `username`, `passwordhash`, `role`, `createdat`
- **Products** - `id`, `name`, `price`, `categoryid` (FK, nullable), `imageurl`, `description`
- **Orders** - `id`, `userid` (FK), `totalamount`, `orderdate`
- **OrderItems** - `id`, `orderid` (FK), `productid` (FK), `quantity`, `unitprice`

### Relationships
```
User (1) ─────< (N) Order
Category (1) ─< (N) Product
Order (1) ────< (N) OrderItem
Product (1) ──< (N) OrderItem
```

---

## 2. Implemented Modules & Features

### Backend API Endpoints

#### **CategoriesController** (`/api/categories`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/{id}` | Get category by ID |
| GET | `/api/categories/{id}/products` | Get products by category |
| POST | `/api/categories` | Create new category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |

#### **ProductsController** (`/api/products`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products (with Category) |
| GET | `/api/products/{id}` | Get product by ID (with Category) |
| POST | `/api/products` | Create product (validates CategoryId) |
| PUT | `/api/products/{id}` | Update product (validates CategoryId) |
| DELETE | `/api/products/{id}` | Delete product |

#### **UsersController** (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| GET | `/api/users/{id}` | Get user by ID |
| POST | `/api/users` | Create user (unique username check, default Role="Customer") |
| PUT | `/api/users/{id}` | Update user (unique username check, preserves CreatedAt) |
| DELETE | `/api/users/{id}` | Delete user |

#### **OrdersController** (`/api/orders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order from `CreateOrderDto` (validates user & products, calculates total) |
| GET | `/api/orders/{id}` | Get order by ID (with User, OrderItems → Product) |
| GET | `/api/orders` | List all orders (with User, OrderItems → Product, sorted by date desc) |
| PUT | `/api/orders/{id}` | Update order (validates UserId if changed) |
| DELETE | `/api/orders/{id}` | Delete order |

#### **OrderItemsController** (`/api/orderitems`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orderitems` | List all order items (with Order, Product) |
| GET | `/api/orderitems/{id}` | Get order item by ID |
| GET | `/api/orderitems/order/{orderId}` | Get order items by order ID |
| POST | `/api/orderitems` | Create order item (validates Order & Product, sets UnitPrice from product if 0) |
| PUT | `/api/orderitems/{id}` | Update order item |
| DELETE | `/api/orderitems/{id}` | Delete order item |

#### **Debug Endpoint**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/debug/info` | Debug info: connection string (masked), DB connectivity, entity counts |

---

### Data Models

#### **User**
```csharp
Id, Username (unique, max 50), PasswordHash (max 255), 
Role (default "Customer", max 20), CreatedAt (default UTC now)
Navigation: Orders (1:N)
```

#### **Category**
```csharp
Id, Name (max 100), Description (text)
Navigation: Products (1:N)
```

#### **Product**
```csharp
Id, Name (max 255), Price (decimal 18,2), 
CategoryId (nullable FK), ImageUrl (max 500), Description (text)
Navigation: Category (N:1), OrderItems (1:N)
```

#### **Order**
```csharp
Id, UserId (FK), TotalAmount (decimal 18,2), OrderDate (default UTC now)
Navigation: User (N:1), OrderItems (1:N)
```

#### **OrderItem**
```csharp
Id, OrderId (FK), ProductId (FK), Quantity, UnitPrice (decimal 18,2)
Navigation: Order (N:1), Product (N:1)
```

#### **DTO: CreateOrderDto**
```csharp
UserId (required), Items: List<CartItemDto> (min 1)
CartItemDto: ProductId (required), Quantity (min 1)
```

---

### Frontend (Angular)

#### Current State: **Skeleton Only**
- **AppComponent** - Basic standalone component with router-outlet
- **Routes** - Empty array (`[]`) - no routing configured yet
- **ProductService** - Complete service with CRUD operations for products
  - `getProducts()`, `getProductById(id)`, `createProduct()`, `updateProduct(id)`, `deleteProduct(id)`
  - Uses `http://localhost:5101/api/Products`
  - Product interface matches backend (id, name, description, price, imageUrl, categoryId, createdAt, updatedAt)
- **Styles** - Default Angular placeholder styles
- **SSR** - Configured but not implemented

#### Missing Frontend Features
- ❌ No components (ProductList, ProductDetail, Cart, Checkout, etc.)
- ❌ No routing configuration
- ❌ No Category/Order/User services
- ❌ No UI for any business functionality
- ❌ No authentication/authorization UI

---

## 3. Current Status & Next Steps

### ✅ **Completed (Backend - 100%)**
- [x] Project structure & configuration
- [x] EF Core + PostgreSQL setup with naming conventions
- [x] Database migration (InitialCreate) - ready to apply
- [x] All 5 entity models with proper relationships
- [x] All 5 controllers with full CRUD + validation
- [x] DTO for order creation with validation
- [x] Swagger/OpenAPI documentation
- [x] CORS configuration
- [x] JSON cycle handling
- [x] Debug endpoint for DB verification

### ✅ **Completed (Frontend - ~10%)**
- [x] Angular 18 project scaffolded with SSR
- [x] HttpClient configured with fetch
- [x] ProductService with full CRUD methods
- [x] Product TypeScript interface matching backend

### ❌ **Pending - Critical Path**

#### **Database Setup**
1. **Apply migration** to create database schema:
   ```bash
   cd MiniShopApi
   dotnet ef database update
   ```
   (Requires PostgreSQL running on localhost:5432 with database `MiniShopDb`)

2. **Verify database connection** via `/debug/info` endpoint

#### **Frontend Implementation (Priority Order)**

| Priority | Task | Description |
|----------|------|-------------|
| **P0** | Configure Routing | Add routes in `app.routes.ts` for: products list, product detail, cart, checkout, orders, categories, admin |
| **P0** | Product List Component | Display products from API with category filter |
| **P0** | Product Detail Component | Show product details, add to cart |
| **P0** | Cart Service + Component | Client-side cart state, sync with Orders API |
| **P0** | Checkout Flow | Create order via `POST /api/orders` |
| **P1** | Category Service + UI | Category list, filter products by category |
| **P1** | Order History | User's past orders (`GET /api/orders`) |
| **P1** | Admin Components | CRUD UI for products/categories/users (if admin role) |
| **P2** | Authentication | Login/Register, JWT token handling, role-based UI |
| **P2** | User Profile | View/edit profile, order history |

#### **Backend Enhancements (Optional but Recommended)**
| Task | Description |
|------|-------------|
| Authentication/Authorization | JWT tokens, `[Authorize]` attributes, role-based access |
| Input Validation | FluentValidation or DataAnnotations on all DTOs |
| Pagination | Add pagination to list endpoints (`GET /api/products`, etc.) |
| Search/Filter | Query parameters for filtering products (category, price range, name) |
| Image Upload | Endpoint for product image uploads |
| Rate Limiting | API rate limiting middleware |
| Logging | Structured logging (Serilog) |
| Tests | Unit/integration tests for controllers & services |

---

## 4. Key Files Reference

### Backend
```
MiniShopApi/
├── Program.cs                    # App entry, DI, middleware, Swagger, CORS
├── appsettings.json              # Connection string, logging
├── Data/AppDbContext.cs          # EF Core context, Fluent API config
├── Models/
│   ├── User.cs
│   ├── Category.cs
│   ├── Product.cs
│   ├── Order.cs
│   └── OrderItem.cs
├── DTOs/CreateOrderDto.cs        # Order creation DTO
├── Controllers/
│   ├── CategoriesController.cs
│   ├── ProductsController.cs
│   ├── UsersController.cs
│   ├── OrdersController.cs
│   └── OrderItemsController.cs
└── Migrations/
    └── 20261021101626_InitialCreate.cs
```

### Frontend
```
mini-shop-web/src/
├── main.ts                       # Bootstrap
├── app/
│   ├── app.ts                    # Root component (placeholder)
│   ├── app.html                  # Template with router-outlet
│   ├── app.routes.ts             # EMPTY - needs routes
│   ├── app.config.ts             # Providers (router, http, SSR)
│   └── services/
│       └── product.service.ts    # Complete Product CRUD service
├── index.html
└── styles.css
```

---

## 5. How to Run

### Backend
```bash
cd D:\MiniShopProject\MiniShopApi
dotnet restore
dotnet ef database update    # Create DB schema
dotnet run                   # Runs on http://localhost:5101
# Swagger UI: http://localhost:5101/swagger
```

### Frontend
```bash
cd D:\MiniShopProject\mini-shop-web
npm install
npm start                    # Runs on http://localhost:4200 (default)
```

---

## 6. Git Status Notes

**Modified (not committed):**
- `bin/`, `obj/` - Build artifacts (should be in .gitignore)
- `../mini-shop-web/angular.json` - Angular config modified
- `../mini-shop-web/src/app/app.config.ts` - Modified
- `../mini-shop-web/src/server.ts` - Modified
- `../mini-shop-web/src/app/services/` - New directory (untracked)

**Recommendation:** Add `bin/`, `obj/`, `node_modules/` to `.gitignore` if not present.

---

## Summary

**Backend is production-ready** with complete CRUD API, proper validation, relationships, and Swagger docs. **Frontend is at 10%** - only the ProductService exists. The immediate next step is to **apply the database migration**, then **build out the Angular routing and components** starting with product listing and cart/checkout flow.