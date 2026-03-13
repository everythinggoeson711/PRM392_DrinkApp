-- ============================================================
-- Drink Order App - Seed Data Verification
-- ============================================================

DO $$
DECLARE
  v_users INTEGER;
  v_categories INTEGER;
  v_products INTEGER;
  v_orders INTEGER;
  v_order_items INTEGER;
  v_bad_products INTEGER;
  v_null_product_category INTEGER;
  v_orders_without_items INTEGER;
  v_total_mismatch INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_users FROM users;
  SELECT COUNT(*) INTO v_categories FROM categories;
  SELECT COUNT(*) INTO v_products FROM products;
  SELECT COUNT(*) INTO v_orders FROM orders;
  SELECT COUNT(*) INTO v_order_items FROM order_items;

  IF v_users < 3 THEN
    RAISE EXCEPTION 'Seed verify failed: expected >= 3 users, got %', v_users;
  END IF;

  IF v_categories < 4 THEN
    RAISE EXCEPTION 'Seed verify failed: expected >= 4 categories, got %', v_categories;
  END IF;

  IF v_products < 6 THEN
    RAISE EXCEPTION 'Seed verify failed: expected >= 6 products, got %', v_products;
  END IF;

  IF v_orders < 2 THEN
    RAISE EXCEPTION 'Seed verify failed: expected >= 2 orders, got %', v_orders;
  END IF;

  IF v_order_items < 4 THEN
    RAISE EXCEPTION 'Seed verify failed: expected >= 4 order items, got %', v_order_items;
  END IF;

  SELECT COUNT(*) INTO v_bad_products
  FROM products
  WHERE price <= 0;

  IF v_bad_products > 0 THEN
    RAISE EXCEPTION 'Seed verify failed: found % products with non-positive price', v_bad_products;
  END IF;

  SELECT COUNT(*) INTO v_null_product_category
  FROM products
  WHERE category_id IS NULL;

  IF v_null_product_category > 0 THEN
    RAISE EXCEPTION 'Seed verify failed: found % products without category', v_null_product_category;
  END IF;

  SELECT COUNT(*) INTO v_orders_without_items
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  GROUP BY o.id
  HAVING COUNT(oi.id) = 0;

  IF COALESCE(v_orders_without_items, 0) > 0 THEN
    RAISE EXCEPTION 'Seed verify failed: found orders without order_items';
  END IF;

  SELECT COUNT(*) INTO v_total_mismatch
  FROM (
    SELECT
      o.id,
      o.total_amount,
      COALESCE(SUM(oi.price), 0)::NUMERIC(10,2) AS items_total
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    GROUP BY o.id
  ) x
  WHERE x.total_amount <> x.items_total;

  IF v_total_mismatch > 0 THEN
    RAISE EXCEPTION 'Seed verify failed: found % orders with invalid total_amount', v_total_mismatch;
  END IF;

  RAISE NOTICE 'Seed verification passed successfully.';
END $$;
