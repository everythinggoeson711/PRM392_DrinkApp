-- ============================================================
-- Drink Order App - FULL Seed Data (FIXED)
-- ============================================================

-- Reset seedable business tables
TRUNCATE TABLE order_items, orders, products, categories RESTART IDENTITY CASCADE;

-- ============================================================
-- USERS
-- ============================================================

INSERT INTO users (name, email, password, role)
SELECT * FROM (
  VALUES
  ('System Admin', 'admin@drinkapp.local', '$2b$10$FBOcvYA7/A76gSqg8q2YT.Qv7EdsxO01Iro9ezwQlHhT74l/TmcDO', 'admin'),
  ('Customer One', 'customer1@example.com', '$2b$10$TG4efTvN8AsAIqGnpAvy6uOQs.wMVHLjbsgtflKQnwsq1wJ7BLiOC', 'customer'),
  ('Customer Two', 'customer2@example.com', '$2b$10$TG4efTvN8AsAIqGnpAvy6uOQs.wMVHLjbsgtflKQnwsq1wJ7BLiOC', 'customer')
) AS v(name, email, password, role)
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.email = v.email
);

-- ============================================================
-- CATEGORIES
-- ============================================================

INSERT INTO categories (name, description)
SELECT * FROM (
  VALUES
  ('Milk Tea', 'Classic milk tea and flavored variants'),
  ('Fruit Tea', 'Fresh fruit tea collection'),
  ('Coffee', 'Coffee-based drinks'),
  ('Toppings', 'Extra toppings and add-ons'),
  ('Smoothie', 'Blended fruit smoothies'),
  ('Juice', 'Fresh cold-pressed juices'),
  ('Special Drinks', 'Signature drinks and trending items')
) AS v(name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.name = v.name
);

-- ============================================================
-- PRODUCTS
-- ============================================================

-- helper macro logic
-- chỉ insert nếu chưa tồn tại

-- Milk Tea
INSERT INTO products (name, price, image_url, category_id)
SELECT 'Brown Sugar Milk Tea', 45000, 'https://d2lswn7b0fl4u2.cloudfront.net/photos/pg-brown-sugar-boba-milk-tea-1689878299.jpg', c.id
FROM categories c
WHERE c.name = 'Milk Tea'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Brown Sugar Milk Tea');

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Classic Milk Tea', 39000, 'https://www.9cha.uk/cdn/shop/files/classic-milk-tea.jpg?v=1734087869&width=1445', c.id
FROM categories c
WHERE c.name = 'Milk Tea'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Classic Milk Tea');

-- Fruit Tea
INSERT INTO products (name, price, image_url, category_id)
SELECT 'Peach Oolong Tea', 42000, 'https://www.sunnysyrup.com/proimages/recipe/04Fruit_Tea/01%20Peach%20Oolong%20Tea%20with%20Peach%20Cube.jpg', c.id
FROM categories c
WHERE c.name = 'Fruit Tea'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Peach Oolong Tea');

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Passion Fruit Tea', 40000, 'https://www.nestleprofessional.in/sites/default/files/2021-08/Mellow-Yellow.jpg', c.id
FROM categories c
WHERE c.name = 'Fruit Tea'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Passion Fruit Tea');

-- Coffee
INSERT INTO products (name, price, image_url, category_id)
SELECT 'Latte', 47000, 'https://vinbarista.com/uploads/news/ca-phe-latte-la-gi-latte-co-vi-gi-latte-khac-gi-capuchino-202408161122.jpg', c.id
FROM categories c
WHERE c.name = 'Coffee'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Latte');

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Americano', 35000, 'https://www.cubes-asia.com/storage/blogs/2023/cafe-americano.jpg', c.id
FROM categories c
WHERE c.name = 'Coffee'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Americano');

-- Smoothie
INSERT INTO products (name, price, image_url, category_id)
SELECT 'Strawberry Smoothie', 48000, 'https://dinnerthendessert.com/wp-content/uploads/2024/07/Strawberry-Smoothie-13.jpg', c.id
FROM categories c
WHERE c.name = 'Smoothie'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Strawberry Smoothie');

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Mango Smoothie', 50000, 'https://assets.tmecosys.com/image/upload/t_web_rdp_recipe_584x480_1_5x/img/recipe/ras/Assets/47C465D5-1FC5-46D3-B507-3DFD4CBE952E/Derivates/4d16cb2c-0cc8-4394-9c8d-aad0340be93c.jpg', c.id
FROM categories c
WHERE c.name = 'Smoothie'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Mango Smoothie');

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Avocado Smoothie', 52000, 'https://loveonetoday.com/wp-content/uploads/2018/01/Love-One-Today-Avocado-Recipes-Featured-The-Ultimate-Avocado-Smoothie.jpg', c.id
FROM categories c
WHERE c.name = 'Smoothie'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Avocado Smoothie');

-- Juice
INSERT INTO products (name, price, image_url, category_id)
SELECT 'Orange Juice', 35000, 'https://happyfoodhealthylife.com/wp-content/uploads/2023/05/blood-orange-juice-recipe.jpg', c.id
FROM categories c
WHERE c.name = 'Juice'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Orange Juice');

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Watermelon Juice', 30000, 'https://www.justonecookbook.com/wp-content/uploads/2021/06/Watermelon-Juice-9016.jpg', c.id
FROM categories c
WHERE c.name = 'Juice'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Watermelon Juice');

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Pineapple Juice', 32000, 'https://media.post.rvohealth.io/wp-content/uploads/sites/3/2020/02/317061_2200-732x549.jpg', c.id
FROM categories c
WHERE c.name = 'Juice'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Pineapple Juice');

-- Special Drinks
INSERT INTO products (name, price, image_url, category_id)
SELECT 'Matcha Latte', 55000, 'https://kingcoffee.com.vn/wp-content/uploads/2026/01/cach-pha-matcha-latte-1536x690.jpg', c.id
FROM categories c
WHERE c.name = 'Special Drinks'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Matcha Latte');

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Chocolate Ice Blended', 60000, 'https://gfbfood.com.my/wp-content/uploads/2022/08/banner-chocolate-recipe.jpg.webp', c.id
FROM categories c
WHERE c.name = 'Special Drinks'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Chocolate Ice Blended');

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Salted Coffee', 45000, 'https://media.cnn.com/api/v1/images/stellar/prod/gettyimages-1716973888.jpg?c=original', c.id
FROM categories c
WHERE c.name = 'Special Drinks'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Salted Coffee');

-- Toppings
INSERT INTO products (name, price, image_url, category_id)
SELECT 'Cheese Foam', 10000, 'https://cdn.tgdd.vn/2021/01/CookProduct/1200-1200x676-91.jpg', c.id
FROM categories c WHERE c.name = 'Toppings'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Cheese Foam');

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Crystal Boba', 12000, 'https://www.kimecopak.ca/cdn/shop/articles/Crystal-Boba_762da7d3-154c-420d-931f-b01a7d25b331.png?v=1750739197', c.id
FROM categories c WHERE c.name = 'Toppings'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Crystal Boba');

INSERT INTO products (name, price, image_url, category_id)
SELECT 'Egg Pudding', 10000, 'https://i.ytimg.com/vi/86ibRTpkp_M/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBQ6tUT3lY5zMFlF6b8XpcuI2H57Q', c.id
FROM categories c WHERE c.name = 'Toppings'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'Egg Pudding');

-- ============================================================
-- ORDERS + PAYMENT (GIỮ NGUYÊN)
-- ============================================================

-- (giữ nguyên phần dưới của bạn)