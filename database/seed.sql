-- ============================================================
-- Drink Order App - Seed Data
-- ============================================================

-- Reset seedable business tables to keep seed deterministic on reruns
TRUNCATE TABLE order_items, orders, products, categories RESTART IDENTITY CASCADE;

-- USERS
INSERT INTO users (name, email, password, role)
VALUES
  ('System Admin', 'admin@drinkapp.local', '$2b$10$FBOcvYA7/A76gSqg8q2YT.Qv7EdsxO01Iro9ezwQlHhT74l/TmcDO', 'admin'),
  ('Customer One', 'customer1@example.com', '$2b$10$TG4efTvN8AsAIqGnpAvy6uOQs.wMVHLjbsgtflKQnwsq1wJ7BLiOC', 'customer'),
  ('Customer Two', 'customer2@example.com', '$2b$10$TG4efTvN8AsAIqGnpAvy6uOQs.wMVHLjbsgtflKQnwsq1wJ7BLiOC', 'customer')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  updated_at = NOW();

-- CATEGORIES
INSERT INTO categories (name, description)
VALUES
  ('Milk Tea', 'Classic milk tea and flavored variants'),
  ('Fruit Tea', 'Fresh fruit tea collection'),
  ('Coffee', 'Coffee-based drinks'),
  ('Toppings', 'Extra toppings and add-ons');

-- PRODUCTS
INSERT INTO products (name, price, image_url, category_id)
SELECT 'Brown Sugar Milk Tea', 45000, 'https://teakandthyme.com/wp-content/uploads/2022/11/brown-sugar-milk-tea-DSC_0482-1600.jpg', c.id
FROM categories c WHERE c.name = 'Milk Tea';

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Classic Milk Tea', 39000, 'https://assets.epicurious.com/photos/5953ca064919e41593325d97/1:1/w_3744,h_3744,c_limit/bubble_tea_recipe_062817.jpg', c.id
FROM categories c WHERE c.name = 'Milk Tea';

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Peach Oolong Tea', 42000, 'https://www.sunnysyrup.com/proimages/recipe/04Fruit_Tea/01%20Peach%20Oolong%20Tea%20with%20Peach%20Cube.jpg', c.id
FROM categories c WHERE c.name = 'Fruit Tea';

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Passion Fruit Tea', 40000, 'https://www.stephsunshine.com/static/aca3ad24d331a17ce08b7f3a2ad4c3fc/501e6/Passion-Fruit-Iced-Tea-Hero-11.jpg', c.id
FROM categories c WHERE c.name = 'Fruit Tea';

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Latte', 47000, 'https://vinbarista.com/uploads/news/ca-phe-latte-la-gi-latte-co-vi-gi-latte-khac-gi-capuchino-202408161122.jpg', c.id
FROM categories c WHERE c.name = 'Coffee';

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Americano', 35000, 'https://www.cubes-asia.com/storage/blogs/2023/cafe-americano.jpg', c.id
FROM categories c WHERE c.name = 'Coffee';

-- ORDERS + ORDER ITEMS
WITH seed_order AS (
  INSERT INTO orders (user_id, customer_name, phone, address, total_amount, status)
  SELECT u.id, 'Customer One', '0901234567', 'Ho Chi Minh City', 0, 'PENDING'
  FROM users u
  WHERE u.email = 'customer1@example.com'
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, quantity, size, sugar_level, ice_level, toppings, price)
SELECT so.id, p.id, 2, 'L', '70%', '50%', 'pearl,pudding', 90000
FROM seed_order so
JOIN products p ON p.name = 'Brown Sugar Milk Tea'
UNION ALL
SELECT so.id, p.id, 1, 'M', '50%', '50%', 'aloe', 42000
FROM seed_order so
JOIN products p ON p.name = 'Peach Oolong Tea';

WITH seed_order AS (
  INSERT INTO orders (user_id, customer_name, phone, address, total_amount, status)
  SELECT u.id, 'Customer Two', '0912345678', 'Da Nang', 0, 'PROCESSING'
  FROM users u
  WHERE u.email = 'customer2@example.com'
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, quantity, size, sugar_level, ice_level, toppings, price)
SELECT so.id, p.id, 1, 'M', '100%', '70%', 'pearl', 39000
FROM seed_order so
JOIN products p ON p.name = 'Classic Milk Tea'
UNION ALL
SELECT so.id, p.id, 1, 'M', '100%', '70%', NULL, 35000
FROM seed_order so
JOIN products p ON p.name = 'Americano';

UPDATE orders o
SET total_amount = totals.total
FROM (
  SELECT order_id, COALESCE(SUM(price), 0)::NUMERIC(10,2) AS total
  FROM order_items
  GROUP BY order_id
) totals
WHERE totals.order_id = o.id;

-- PAYMENTS
INSERT INTO payments (order_id, amount, payment_code, status)
SELECT o.id, o.total_amount, 'PAYMENT-' || o.id, 'PAID'
FROM orders o
WHERE o.status IN ('PROCESSING', 'COMPLETED')
ON CONFLICT (payment_code) DO NOTHING;
