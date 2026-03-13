# RUN TEST GUIDE - PRM392_DrinkApp Backend

Tai lieu nay danh cho nguoi tiep theo de chay backend, seed data, va test nhanh.

## 1) Dieu kien can

- Da cai Node.js (khuyen nghi Node 22)
- Da cai Docker Desktop va dang chay
- Da cai npm

## 2) Cai dependencies

Tai thu muc project:

- npm install --legacy-peer-deps

Ghi chu: project hien tai co the gap xung dot peer dependencies neu khong dung flag tren.

## 3) Khoi dong database Docker

- docker compose up -d db
- docker compose ps

Neu can reset sach DB tu dau:

- npm run docker:db:reset

## 4) Seed du lieu va verify tinh dung dan

Lenh chuan nen dung:

- npm run seed:docker:all

Lenh nay se:

- Seed day du users/categories/products/orders/order_items
- Chay verify SQL de check:
  - So luong du lieu toi thieu
  - Product co category va gia hop le
  - total_amount cua order khop tong order_items

## 5) Build va e2e test

- npm run build
- npm run test:e2e

Ky vong:

- build pass
- test:e2e pass

## 6) Chay backend local

- npm run start:dev

Mac dinh API chay tai:

- http://localhost:3000

Swagger UI:

- http://localhost:3000/api/docs

## 7) Tai khoan test mac dinh

Admin:

- email: admin@drinkapp.local
- password: admin123

Customer:

- email: customer1@example.com
- password: secret123

## 8) Thu tu test tay de demo nhanh

1. Login admin: POST /auth/login
2. Xem categories: GET /categories
3. Tao category moi (admin): POST /categories
4. Upload anh san pham (admin): POST /products/upload-image (multipart field `image`)
5. Tao product moi (admin): POST /products (gan imageUrl vua upload)
6. Tao order: POST /orders
7. Update order status (admin): PATCH /orders/:id/status

## 8.1) Luu tru anh tren VPS

- Anh duoc luu local tai thu muc:
  - `uploads/products`
- Anh duoc public qua static route:
  - `/uploads/products/<filename>`

## 9) Postman

Import collection:

- docs/DrinkApp.postman_collection.json

Doc huong dan tich hop:

- docs/API_INTEGRATION.md

## 10) Xu ly su co thuong gap

Loi password authentication failed:

- Kiem tra Docker container db dang chay
- Chay lai: npm run seed:docker:all
- Neu van loi: npm run docker:db:reset roi seed lai

Port 5432 dang bi chiem:

- Dung service PostgreSQL khac tren may hoac doi port compose

Swagger khong mo duoc:

- Kiem tra backend da start:dev chua
- Kiem tra URL: http://localhost:3000/api/docs
