-- ============================================================
-- Drink Order App - PostgreSQL Schema
-- ============================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    email       VARCHAR(150)        NOT NULL UNIQUE,
    password    VARCHAR(255)        NOT NULL,
    role        VARCHAR(20)         NOT NULL DEFAULT 'customer'  CHECK (role IN ('admin', 'customer')),
    created_at  TIMESTAMP           NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    description TEXT
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(150)        NOT NULL,
    price       NUMERIC(10, 2)      NOT NULL,
    image_url   VARCHAR(500),
    category_id INTEGER             REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER             REFERENCES users(id) ON DELETE SET NULL,
    customer_name   VARCHAR(100)        NOT NULL,
    phone           VARCHAR(20)         NOT NULL,
    address         VARCHAR(255),
    total_amount    NUMERIC(10, 2)      NOT NULL,
    status          VARCHAR(20)         NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED')),
    created_at      TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE order_items (
    id          SERIAL PRIMARY KEY,
    order_id    INTEGER             NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  INTEGER             REFERENCES products(id) ON DELETE SET NULL,
    quantity    INTEGER             NOT NULL DEFAULT 1,
    size        VARCHAR(5),                     -- S, M, L
    sugar_level VARCHAR(10),                    -- 100%, 70%, 50%, 30%, 0%
    ice_level   VARCHAR(10),                    -- 100%, 70%, 50%, 0%
    toppings    TEXT,                           -- comma-separated list
    price       NUMERIC(10, 2)      NOT NULL
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_user       ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
