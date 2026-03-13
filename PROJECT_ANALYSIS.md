# Phân tích tổng thể project PRM392_DrinkApp

## 1) Quét toàn bộ project và mô tả kiến trúc

## Project này là gì?

Đây là **backend API cho ứng dụng đặt đồ uống** (Drink Order App), viết bằng **NestJS + TypeScript**, dùng **PostgreSQL** làm cơ sở dữ liệu và **TypeORM** để ánh xạ entity.

Mục tiêu của backend là cung cấp API cho app Android (làm bằng Android Studio) để:

- quản lý người dùng,
- quản lý danh mục và sản phẩm,
- tạo và theo dõi đơn hàng,
- lưu trữ dữ liệu bền vững trong PostgreSQL.

## Kiến trúc hiện tại

### 1. Kiến trúc lớp (Layered Architecture theo NestJS)

Project đang theo mô hình chuẩn của NestJS:

- `Controller`: nhận HTTP request, map endpoint.
- `Service`: xử lý nghiệp vụ.
- `Entity`: mô hình dữ liệu DB (TypeORM).
- `Module`: gom nhóm tính năng.

### 2. Cấu trúc module nghiệp vụ

Hiện có 4 module domain:

- `users`
- `categories`
- `products`
- `orders`

Trạng thái triển khai thực tế:

- `users`: đã có CRUD, validate DTO, hash password bằng `bcrypt`.
- `categories`: mới scaffold, controller/service đang rỗng.
- `products`: mới scaffold, controller/service đang rỗng.
- `orders`: mới scaffold, controller/service đang rỗng.

### 3. Tầng dữ liệu

- DB dùng PostgreSQL, có `docker-compose.yml` để chạy local database.
- `database/schema.sql` đã mô tả đầy đủ bảng: `users`, `categories`, `products`, `orders`, `order_items`.
- `AppModule` hiện chỉ đăng ký entity `User` trong `TypeOrmModule.forRoot(...)`.

Hệ quả:

- Dù đã có entity cho `Category/Product/Order/OrderItem`, backend **chưa hoạt động đầy đủ** cho các phần này vì chưa được wiring đầy đủ vào module gốc và service.

### 4. Quan hệ dữ liệu chính (theo entity + schema)

- `Category` 1-n `Product`
- `Order` 1-n `OrderItem`
- `OrderItem` n-1 `Product`
- `Order` có liên hệ `User` trong schema SQL (trường `user_id`), nhưng entity `Order` hiện chưa map trường này rõ ràng.

### 5. Nhận xét kỹ thuật nhanh

Điểm tốt:

- Nền tảng NestJS chuẩn, dễ mở rộng.
- Có Docker cho PostgreSQL.
- User module đã có xử lý hash password, tránh trả password ra response.

Thiếu/GAP quan trọng:

- Chưa có authentication/authorization (JWT, guard, role guard).
- Chưa có API cho `categories/products/orders`.
- Chưa có DTO cho các domain còn lại.
- Chưa bật global validation pipe ở `main.ts`.
- Chưa có migration/seed (đang dùng `schema.sql` thủ công).
- Chưa có test unit/e2e cho nghiệp vụ chính.

---

## 2) Bạn làm Backend thì trách nhiệm là gì?

Vì app Android cần gọi API, phần BE của bạn chịu trách nhiệm đảm bảo **đúng dữ liệu - đúng nghiệp vụ - an toàn - ổn định**.

## Trách nhiệm chính của bạn

1. Thiết kế và hoàn thiện API contract cho mobile

- Định nghĩa endpoint, request/response chuẩn JSON.
- Quy ước mã lỗi HTTP và thông điệp lỗi rõ ràng.

2. Xây dựng nghiệp vụ server-side

- CRUD danh mục, sản phẩm.
- Tạo đơn hàng có item, tính tổng tiền chính xác.
- Quản lý trạng thái đơn hàng (PENDING -> PROCESSING -> COMPLETED/CANCELLED).

3. Quản lý dữ liệu và toàn vẹn dữ liệu

- Mapping entity đúng với schema.
- Ràng buộc dữ liệu bằng DTO validation + DB constraints.
- Hạn chế data inconsistency (ví dụ sản phẩm không tồn tại vẫn vào đơn).

4. Bảo mật backend

- Đăng nhập/đăng ký, hash password, cấp JWT.
- Phân quyền: admin/customer.
- Bảo vệ endpoint nhạy cảm bằng guards.

5. Đảm bảo chất lượng và tích hợp với Android

- Viết test cơ bản cho luồng chính.
- Tài liệu API để Android team tích hợp nhanh.
- Hỗ trợ debug lỗi giữa app và server (format lỗi, log).

## Nhiệm vụ cụ thể bạn cần làm

### Nhóm A - Foundation

- Kết nối đầy đủ các module vào `AppModule`.
- Đăng ký toàn bộ entity cần thiết cho TypeORM.
- Bật `ValidationPipe` toàn cục (whitelist, forbidNonWhitelisted, transform).

### Nhóm B - Auth + User

- Thêm auth module (register/login).
- Dùng JWT access token.
- Bổ sung role-based guard cho các API admin.
- Chuẩn hóa response user (không lộ password).

### Nhóm C - Categories API

- DTO create/update.
- CRUD đầy đủ.
- Validate name không rỗng, xử lý duplicate nếu cần.

### Nhóm D - Products API

- DTO create/update.
- CRUD + lọc theo category + tìm kiếm theo tên.
- Validate giá > 0, category tồn tại.

### Nhóm E - Orders API

- DTO tạo order và order item.
- Tạo đơn hàng theo transaction.
- Tính `totalAmount` từ item server-side.
- API đổi trạng thái đơn (admin), API xem đơn theo user.

### Nhóm F - Chất lượng triển khai

- Viết unit test service chính.
- Viết e2e test cho luồng create order.
- Viết tài liệu API (Postman collection hoặc Swagger).

---

## 3) Kế hoạch hoàn thành nhiệm vụ backend

## Mục tiêu đầu ra

Sau khi hoàn thành, backend phải đạt:

- Android app gọi được toàn bộ luồng chính: đăng nhập -> xem menu -> tạo đơn -> theo dõi đơn.
- Có phân quyền cơ bản admin/customer.
- Dữ liệu chính xác, validate đầy đủ, có test smoke cho luồng chính.

## Kế hoạch theo giai đoạn (đề xuất 4 tuần)

### Tuần 1 - Củng cố nền tảng và Auth

Việc cần làm:

- Chuẩn hóa cấu hình DB (ưu tiên env thay hard-code).
- Bật global validation pipe.
- Hoàn thiện auth module: register/login/JWT.
- Viết guard xác thực cơ bản.

Deliverable:

- API auth chạy ổn định.
- Người dùng đăng nhập nhận token và gọi được endpoint bảo vệ.

### Tuần 2 - Categories và Products

Việc cần làm:

- Hoàn thiện CRUD categories.
- Hoàn thiện CRUD products + filter/search.
- Validate dữ liệu đầu vào và xử lý lỗi nghiệp vụ.

Deliverable:

- Android có thể tải danh sách danh mục/sản phẩm và xem chi tiết.

### Tuần 3 - Orders end-to-end

Việc cần làm:

- Tạo đơn hàng với nhiều item.
- Tính tổng tiền tại server.
- API danh sách đơn theo user/admin.
- API cập nhật trạng thái đơn với rule chuyển trạng thái.

Deliverable:

- Luồng đặt hàng hoàn chỉnh từ app xuống DB.

### Tuần 4 - Test, tài liệu, hardening

Việc cần làm:

- Unit test cho service quan trọng.
- E2E test cho auth + create order.
- Hoàn thiện tài liệu API và ví dụ payload.
- Rà soát bảo mật cơ bản (input validation, auth guard coverage).

Deliverable:

- Backend sẵn sàng demo/chấm môn với bằng chứng test + tài liệu.

## Checklist thực thi chi tiết

- [ ] Import `UsersModule`, `CategoriesModule`, `ProductsModule`, `OrdersModule` vào `AppModule`.
- [ ] Đăng ký đầy đủ entities cho TypeORM.
- [ ] Thêm `.env` + `ConfigModule` cho DB config.
- [ ] Bật `ValidationPipe` trong `main.ts`.
- [ ] Tạo `auth` module (JWT strategy, guards).
- [ ] Hoàn thiện DTO + service + controller cho categories.
- [ ] Hoàn thiện DTO + service + controller cho products.
- [ ] Hoàn thiện DTO + service + controller cho orders + order_items.
- [ ] Bổ sung test (unit/e2e) cho các luồng chính.
- [ ] Tạo tài liệu API để team Android tích hợp.

## Rủi ro và cách giảm rủi ro

1. API đổi liên tục làm Android bị vỡ tích hợp

- Cách xử lý: chốt API contract sớm, version endpoint khi cần.

2. Sai lệch giữa entity và schema SQL

- Cách xử lý: thống nhất một nguồn sự thật (migrations hoặc schema quản lý chặt).

3. Lỗi logic tổng tiền/đơn hàng

- Cách xử lý: tính toán tại server + test case cho nhiều biến thể item.

4. Thiếu thời gian cuối kỳ

- Cách xử lý: ưu tiên luồng core (auth, menu, create order) trước, phần nâng cao sau.

---

## Kết luận ngắn

Project hiện là backend NestJS cho app đặt đồ uống, đang ở mức khởi tạo tốt nhưng mới hoàn thiện phần `users`. Trách nhiệm BE của bạn là hoàn thiện các domain còn lại (`categories`, `products`, `orders`), bổ sung `auth`, đảm bảo chất lượng API để Android tích hợp ổn định, và triển khai theo kế hoạch 4 tuần ở trên.
