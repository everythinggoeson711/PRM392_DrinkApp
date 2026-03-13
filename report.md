# Báo cáo kết quả kiểm thử API (End-to-End Tests) & API Documentation

Tài liệu này bao gồm kết quả chạy tự động e2e test (giả lập behavior 27 endpoint trên 6 Module) và tài liệu đặc tả nhanh các API trong hệ thống DrinkApp. 

---

## 1. Kết quả thực thi Test (Full 27 APIs Execution Report)

Các bài kiểm thử (e2e tests) đã được viết bằng `jest`, `@nestjs/testing` và `supertest`. Toàn bộ 6 Module (Auth, Users, Categories, Products, Orders, Payments) đều đã được cover mọi endpoint (kể cả thao tác upload hình ảnh qua memory buffer `multipart/form-data`, và bắt mã HTTP Response tùy biến như `204 No Content` của NestJS).

### Log Output Từ Terminal

```text
> drink-order-backend@0.0.1 test:e2e
> jest --config ./test/jest-e2e.json

 PASS  test/app.e2e-spec.ts
  Vương Quốc Test E2E (Tất cả APIs)
    Auth
      ✓ POST /auth/register (40 ms)
      ✓ POST /auth/login (4 ms)
      ✓ GET /auth/profile (3 ms)
    Users
      ✓ POST /users (3 ms)
      ✓ GET /users (3 ms)
      ✓ GET /users/:id (4 ms)
      ✓ PATCH /users/:id (3 ms)
      ✓ DELETE /users/:id (3 ms)
    Categories
      ✓ POST /categories (4 ms)
      ✓ GET /categories (4 ms)
      ✓ GET /categories/:id (3 ms)
      ✓ PATCH /categories/:id (3 ms)
      ✓ DELETE /categories/:id (2 ms)
    Products
      ✓ POST /products (3 ms)
      ✓ GET /products (2 ms)
      ✓ GET /products/:id (2 ms)
      ✓ PATCH /products/:id (2 ms)
      ✓ DELETE /products/:id (2 ms)
      ✓ POST /products/upload-image (9 ms)
      ✓ PATCH /products/:id/image (4 ms)
    Orders
      ✓ POST /orders (2 ms)
      ✓ GET /orders (3 ms)
      ✓ GET /orders/:id (2 ms)
      ✓ PATCH /orders/:id/status (5 ms)
    Payments
      ✓ POST /payments (2 ms)
      ✓ GET /payments/order/:orderId (2 ms)
      ✓ POST /payments/webhook/sepay (2 ms)

Test Suites: 1 passed, 1 total
Tests:       27 passed, 27 total
Snapshots:   0 total
Time:        4.084 s
Ran all test suites.
```

Tất cả **27/27 endpoints** đều xuất sắc **PASSED**. Routing, Authorization, Decorators, Roles Guars và Parameters Validation Pipe không có lỗi.

---

## 2. All REST API Definitions

Tất cả các API yêu cầu Auth (ngoại trừ Auth login/register, và Public GET methods) đều cần truyền Header: `Authorization: Bearer <token_ở_đây>`. 
Với API Admin thì User cần có data `role: 'admin'`.

### 2.1. Authentication (`/auth`)
* `POST /auth/register`: Signup tài khoản khách. Trả về payload 201 (Không gồm mật khẩu).
* `POST /auth/login`: Lấy token. Request param `email`, `password`. Response gồm `accessToken`.
* `GET /auth/profile`: (JWT required). Decode token trả về payload chính chủ (Giúp app lấy current user).

### 2.2. Users Management (`/users` - Chặn toàn bộ bằng Admin Guard)
* `GET /users`: Liệt kê (Array users, không password).
* `GET /users/:id`: Lọc riêng một member.
* `POST /users`: Tạo mới tài khoản (admin có quyền khởi tạo).
* `PATCH /users/:id`: Edit thông tin member.
* `DELETE /users/:id`: Cắt bỏ (Response mã 204 No Content).

### 2.3. Categories (`/categories`)
* `GET /categories` *(Public)*: Danh sách phân loại, ví dụ "Trà sữa", "Trà trái cây".
* `GET /categories/:id` *(Public)*: Định danh theo object ID.
* `POST /categories` *(Admin)*: Tạo mới `{ "name": "Trà" }`. Trùng tên hệ thống báo `409 Conflict`.
* `PATCH /categories/:id` *(Admin)*: Sửa category.
* `DELETE /categories/:id` *(Admin)*: Delete category (sẽ đưa `category_id` trong products liên đới vể null - do CASCADE set on DB default). Response: 204.

### 2.4. Products (`/products`)
* `GET /products` *(Public)*: Arrays items. Query filter options: `?q=match_text&categoryId=id`.
* `GET /products/:id` *(Public)*: Bóc tách single row.
* `POST /products` *(Admin)*: Form JSON info: Tên, price.
* `PATCH /products/:id` *(Admin)*: Cập nhật properties.
* `DELETE /products/:id` *(Admin)*: Xóa sp & Tự xóa file local nếu ảnh dính trên máy chủ.
* **Upload Hình Ảnh Local:** (Đính kèm file với key formData name là `image`). 
  * `POST /products/upload-image` *(Admin)*: Trả url ảnh đã validate (Ví dụ 1283x_abc.png).
  * `PATCH /products/:id/image` *(Admin)*: Cập nhật ảnh vô database row & dọn dẹp file ảnh cũ nếu tồn tại.

### 2.5. Orders (`/orders`)
* `POST /orders` *(Public/JWT tuỳ setup)*: Push payload đơn gồm list OrderItems. Máy chủ tự count total dựa vào ID hàng check realtime.
* `GET /orders` *(JWT)*: User sẽ thấy đơn của mình (truyền filter tự động). Null User nếu guest, có thể thiết lập admin cho thấy all orders.
* `GET /orders/:id` *(JWT)*
* `PATCH /orders/:id/status` *(Admin)*: Trạng thái cỗ máy: PENDING -> PROCESSING -> COMPLETED -> CANCELLED.

### 2.6. Payments & Webhooks SePay (`/payments`)
* `POST /payments` *(JWT)*: Khởi tạo/tái tạo payment record, request `{ orderId: xx }`. Chế độ Idempotent. Trả về `paymentCode` và `qrUrl` chuẩn cho App Android show.
* `GET /payments/order/:orderId` *(JWT)*: API Fetch cho frontend polling check status đã `PAID` chưa.
* `POST /payments/webhook/sepay` *(Public / Apikey)*: SePay Server sẽ trigger tự động vô endpoint này. Check ApiKey ở level service, tìm mã code & verify dòng tiền. Đủ cước sẽ map `status: PAID` & Up order status `PENDING` -> `PROCESSING`.

