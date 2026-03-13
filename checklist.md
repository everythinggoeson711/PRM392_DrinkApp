# Checklist cong viec da thuc hien (dot 1)

Tai lieu nay giai thich ngan gon nhung gi da lam de ban de theo doi.

## A. Foundation da hoan thanh

- [x] Bat CORS va ValidationPipe global trong `src/main.ts`
  - Muc dich:
    - Cho app Android goi API tu domain/port khac.
    - Validate request body tu dong theo DTO.
  - Cau hinh da bat:
    - `whitelist: true`
    - `forbidNonWhitelisted: true`
    - `transform: true`

- [x] Chuyen cau hinh DB sang huong env trong `src/app.module.ts`
  - Muc dich:
    - Khong hard-code host/user/password trong code.
    - De doi moi truong local/staging/prod.

- [x] Import day du module vao app
  - Da import:
    - `UsersModule`
    - `CategoriesModule`
    - `ProductsModule`
    - `OrdersModule`
    - `AuthModule`

- [x] Dang ky day du entity cho TypeORM
  - Da dang ky:
    - `User`, `Category`, `Product`, `Order`, `OrderItem`

- [x] Wiring cho module scaffold rong
  - Da bo sung `controllers` + `providers` cho:
    - `src/categories/categories.module.ts`
    - `src/products/products.module.ts`
    - `src/orders/orders.module.ts`

## B. Auth/JWT da hoan thanh

- [x] Cai package can thiet
  - `@nestjs/config`
  - `@nestjs/jwt`
  - `@nestjs/passport`
  - `passport`
  - `passport-jwt`
  - `@types/passport-jwt`

- [x] Tao auth module day du
  - `src/auth/auth.module.ts`
  - `src/auth/auth.service.ts`
  - `src/auth/auth.controller.ts`
  - `src/auth/strategies/jwt.strategy.ts`
  - `src/auth/guards/jwt-auth.guard.ts`
  - `src/auth/decorators/current-user.decorator.ts`
  - `src/auth/dto/register.dto.ts`
  - `src/auth/dto/login.dto.ts`

- [x] Endpoint da co
  - `POST /auth/register`
    - Tao user moi (mac dinh role `customer`).
  - `POST /auth/login`
    - Dang nhap va tra ve `accessToken` JWT.
  - `GET /auth/profile`
    - Endpoint test JWT, can Bearer token.

- [x] Bao mat can ban
  - So sanh password bang `bcrypt.compare`.
  - Tra loi `UnauthorizedException` neu sai email/password.
  - Khong tra ve password trong response user.

## C. Cau hinh env da them

- [x] Tao file `.env.example`
  - Bien da co:
    - `PORT`
    - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
    - `JWT_SECRET`, `JWT_EXPIRES_IN`

## D. Xac nhan ky thuat

- [x] Da build thanh cong
  - Lenh da chay:
    - `npm run build`
  - Ket qua:
    - Build pass, khong con loi TypeScript.

## E. Luu y quan trong

- Khi cai package trong may ban da gap xung dot peer dependency cu.
- Da giai quyet bang `--legacy-peer-deps` de tiep tuc implementation nhanh.
- Neu ban muon minh, dot tiep theo co the pin lai version package de bo `--legacy-peer-deps` ve sau.

## F. Viec tiep theo (dot 2 de xong nghiep vu BE)

- [x] Hoan thien CRUD `categories` (DTO + service + controller).
- [x] Hoan thien CRUD `products` + filter theo category + search.
- [x] Hoan thien `orders`:
  - create order + items,
  - tinh totalAmount o server,
  - list order theo user/admin,
  - update status voi rule.

## G. Dot 2 da hoan thanh (chi tiet)

- [x] Categories API day du
  - Endpoint:
    - `POST /categories`
    - `GET /categories`
    - `GET /categories/:id`
    - `PATCH /categories/:id`
    - `DELETE /categories/:id`
  - Nghiep vu:
    - Validate du lieu bang DTO.
    - Check trung ten category khi tao/cap nhat.

- [x] Products API day du
  - Endpoint:
    - `POST /products`
    - `GET /products`
    - `GET /products/:id`
    - `PATCH /products/:id`
    - `DELETE /products/:id`
  - Ho tro query:
    - `GET /products?categoryId=1`
    - `GET /products?q=tra`
  - Nghiep vu:
    - Validate `price > 0`.
    - Check category ton tai truoc khi tao/sua product.

- [x] Orders API hoan thien luong chinh
  - Endpoint:
    - `POST /orders`
    - `GET /orders`
    - `GET /orders?userId=1`
    - `GET /orders/:id`
    - `PATCH /orders/:id/status`
  - Nghiep vu:
    - Tao order trong transaction.
    - Tinh `totalAmount` phia server theo quantity * gia san pham.
    - Luu `order_items` kem tuy chon size/sugar/ice/toppings.
    - Rule status:
      - `PENDING -> PROCESSING/CANCELLED`
      - `PROCESSING -> COMPLETED/CANCELLED`
      - `COMPLETED` va `CANCELLED` khong doi tiep.

- [x] Dong bo mapping entity voi `schema.sql`
  - `category_id`, `order_id`, `product_id`, `user_id`
  - `customer_name`, `total_amount`, `created_at`, `sugar_level`, `ice_level`

- [x] Build check
  - Da chay lai `npm run build` va pass sau khi hoan tat dot 2.

## H. Viec con lai (dot tiep theo)

- [x] Them role guard (`admin/customer`) cho endpoint quan tri.
- [x] Khoi tao super-admin seed script.
- [x] Viet e2e test cho luong auth + tao order.
- [x] Bo sung Swagger/Postman de team Android tich hop nhanh.

## I. Dot 3 da hoan thanh (bao mat + test)

- [x] Role-based authorization
  - Da them:
    - `src/auth/decorators/roles.decorator.ts`
    - `src/auth/guards/roles.guard.ts`
  - Da ap dung cho endpoint admin:
    - Toan bo `users/*`
    - `POST/PATCH/DELETE categories/*`
    - `POST/PATCH/DELETE products/*`
    - `PATCH /orders/:id/status`

- [x] Seed script tao admin
  - File: `src/scripts/seed-admin.ts`
  - Script npm: `npm run seed:admin`
  - Bien co the tuy chinh:
    - `ADMIN_EMAIL`
    - `ADMIN_PASSWORD`
    - `ADMIN_NAME`

- [x] E2E test cho auth + create order
  - Da tao:
    - `test/jest-e2e.json`
    - `test/app.e2e-spec.ts`
  - Ket qua:
    - `npm run test:e2e` PASS (3/3 tests)
    - `npm run build` PASS

## J. Lenh chay nhanh

- Build: `npm run build`
- E2E: `npm run test:e2e`
- Seed admin: `npm run seed:admin`

## K. Tai lieu tich hop Android

- [x] Swagger UI da bat
  - URL: `/api/docs`
  - Cau hinh trong `src/main.ts`

- [x] Postman collection
  - `docs/DrinkApp.postman_collection.json`

- [x] Integration guide
  - `docs/API_INTEGRATION.md`

## L. Seed data day du + verify tinh dung dan

- [x] Docker auto-seed tren lan khoi tao DB dau tien
  - Cap nhat `docker-compose.yml` mount `./database` vao `/docker-entrypoint-initdb.d`
  - SQL scripts:
    - `database/schema.sql`
    - `database/seed.sql`
    - `database/verify.sql`

- [x] Seed lai an toan cho DB dang chay (khong can xoa volume)
  - Script: `src/scripts/seed-all.ts`
  - NPM command: `npm run seed:all`

- [x] Kiem tra tinh dung dan sau seed
  - Bat buoc so luong toi thieu users/categories/products/orders/order_items
  - Bat buoc product co category va gia > 0
  - Bat buoc order total_amount = tong order_items.price

- [x] Lenh su dung nhanh
  - Reset DB docker + auto seed lai: `npm run docker:db:reset`
  - Seed + verify cho DB hien tai: `npm run seed:all`

## M. Thanh toan SePay (QR chuyen khoan ngan hang)

- [x] Tao bang `payments` trong `database/schema.sql`
  - Cac truong: id, order_id (FK), payment_code (unique), amount, status, qr_url, sepay_transaction_id, paid_at, created_at
  - status: PENDING | PAID | FAILED | EXPIRED

- [x] Tao `PaymentsModule` (entity / dto / service / controller)
  - `src/payments/entities/payment.entity.ts`
  - `src/payments/dto/create-payment.dto.ts`
  - `src/payments/dto/sepay-webhook.dto.ts`
  - `src/payments/dto/payment-response.dto.ts`
  - `src/payments/payments.service.ts`
  - `src/payments/payments.controller.ts`
  - `src/payments/payments.module.ts`

- [x] Endpoint: POST /payments (JWT required)
  - Tao payment cho 1 don hang, tra ve QR URL de quet chuyen khoan
  - Idempotent: goi lai voi cung orderId se tra ve payment cu

- [x] Endpoint: GET /payments/order/:orderId (JWT required)
  - Kiem tra trang thai thanh toan cua don hang

- [x] Endpoint: POST /payments/webhook/sepay (PUBLIC)
  - SePay goi vao day khi phat hien giao dich
  - Xac thuc bang `Authorization: Apikey <SEPAY_API_KEY>`
  - Tim payment_code trong noi dung chuyen khoan
  - Neu khop: mark PAID, cap nhat order PENDING -> PROCESSING
  - Xu ly gian lan: kiem tra so tien khop (dung sai +-1 VND)

- [x] Bao mat webhook
  - Kiem tra header `Authorization: Apikey`
  - Chi xu ly giao dich transferType = "in"
  - Ghi log cac truong hop bat thuong

- [x] Cau hinh env (them vao `.env.example`)
  - SEPAY_API_KEY
  - SEPAY_BANK_CODE (e.g. MB, VCB)
  - SEPAY_ACCOUNT_NUMBER
  - SEPAY_PAYMENT_PREFIX (e.g. DRK)

- [x] Swagger day du cho Payments module (@ApiTags, @ApiOperation, @ApiBody, etc.)

- [x] Dang ky vao AppModule (PaymentsModule + Payment entity)

- [x] Build pass (0 error)

### Luong thanh toan day du:

```
1. App tao don hang: POST /orders → {orderId: 1}
2. App tao payment:  POST /payments {orderId: 1} → {qrUrl, paymentCode: "DRK1"}
3. Hien thi QR cho nguoi dung quet chuyen khoan
4. Nguoi dung chuyen khoan voi noi dung "DRK1"
5. Ngan hang bao cho SePay → SePay POST /payments/webhook/sepay
6. Backend xac thuc, tim DRK1, mark PAID, order → PROCESSING
7. App poll: GET /payments/order/1 → {status: "PAID"}
```

### Cau hinh SePay tren sepay.vn:
1. Dang ky tai https://sepay.vn
2. Cau hinh -> Webhook URL: https://your-vps/payments/webhook/sepay
3. Lay API Key va dien vao SEPAY_API_KEY
4. Dien so tai khoan ngan hang vao SEPAY_ACCOUNT_NUMBER
