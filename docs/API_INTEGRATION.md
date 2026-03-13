# API Integration Guide

## Swagger docs

- URL: `http://localhost:3000/api/docs`
- Description: OpenAPI UI for all backend endpoints.

## Quick start for Android team

1. Start backend:
   - `npm run start:dev`
2. Seed all data and verify (recommended):
   - `npm run seed:all`
3. Login admin to get token:
   - `POST /auth/login`
4. Use admin token for protected endpoints:
   - `users/*`
   - `POST/PATCH/DELETE /categories`
   - `POST/PATCH/DELETE /products`
   - `PATCH /orders/:id/status`

## Postman

- Collection file: `docs/DrinkApp.postman_collection.json`
- Variables to set:
  - `baseUrl` (default `http://localhost:3000`)
  - `accessToken` (customer token)
  - `adminToken` (admin token)

## Recommended test flow

1. Register customer: `POST /auth/register`
2. Login customer: `POST /auth/login`
3. Login admin: `POST /auth/login` (seeded admin)
4. Create category (admin)
5. Create product (admin)
6. Create order (customer/public)
7. Update order status (admin)

## Product image upload (local VPS storage)

- Uploaded files are stored in server folder:
   - `uploads/products`
- Static file URL is exposed by backend:
   - `/uploads/*`
- Endpoints:
   - `POST /products/upload-image` (admin, multipart field: `image`)
   - `PATCH /products/:id/image` (admin, multipart field: `image`)
- Allowed types:
   - jpg, jpeg, png, webp
- Max file size:
   - 5MB
- Old local image cleanup:
   - On `PATCH /products/:id/image`, previous local image is removed automatically.
   - On `DELETE /products/:id`, local image file is removed automatically.

## Notes

- All requests are JSON.
- Validation is enabled globally.
- Protected endpoints require Bearer token.

## Docker seed flow

- Docker Postgres auto-runs SQL files in `database/` on first init (empty volume):
   - `schema.sql`
   - `seed.sql`
   - `verify.sql`
- You can reseed and verify anytime (without reset volume):
   - `npm run seed:docker:all`
- To force rerun Docker init scripts (clean DB):
   - `npm run docker:db:reset`
- For existing DB without wiping volume, run:
   - `npm run seed:all`
   - If host DB credential is different, prefer Docker command above.
