import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

type SeedCategory = {
  name: string;
  description: string;
};

type SeedProduct = {
  name: string;
  price: number;
  imageUrl: string;
  categoryName: string;
};

type SeedOrderItem = {
  productName: string;
  quantity: number;
  size?: string;
  sugarLevel?: string;
  iceLevel?: string;
  toppings?: string[];
};

type SeedOrder = {
  customerEmail: string;
  customerName: string;
  phone: string;
  address: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  items: SeedOrderItem[];
};

const categories: SeedCategory[] = [
  { name: 'Milk Tea', description: 'Classic milk tea and flavored variants' },
  { name: 'Fruit Tea', description: 'Fresh fruit tea collection' },
  { name: 'Coffee', description: 'Coffee-based drinks' },
  { name: 'Toppings', description: 'Extra toppings and add-ons' },
];

const products: SeedProduct[] = [
  {
    name: 'Brown Sugar Milk Tea',
    price: 45000,
    imageUrl: 'https://example.com/products/brown-sugar-milk-tea.png',
    categoryName: 'Milk Tea',
  },
  {
    name: 'Classic Milk Tea',
    price: 39000,
    imageUrl: 'https://example.com/products/classic-milk-tea.png',
    categoryName: 'Milk Tea',
  },
  {
    name: 'Peach Oolong Tea',
    price: 42000,
    imageUrl: 'https://example.com/products/peach-oolong.png',
    categoryName: 'Fruit Tea',
  },
  {
    name: 'Passion Fruit Tea',
    price: 40000,
    imageUrl: 'https://example.com/products/passion-fruit-tea.png',
    categoryName: 'Fruit Tea',
  },
  {
    name: 'Latte',
    price: 47000,
    imageUrl: 'https://example.com/products/latte.png',
    categoryName: 'Coffee',
  },
  {
    name: 'Americano',
    price: 35000,
    imageUrl: 'https://example.com/products/americano.png',
    categoryName: 'Coffee',
  },
];

const orders: SeedOrder[] = [
  {
    customerEmail: 'customer1@example.com',
    customerName: 'Customer One',
    phone: '0901234567',
    address: 'Ho Chi Minh City',
    status: 'PENDING',
    items: [
      {
        productName: 'Brown Sugar Milk Tea',
        quantity: 2,
        size: 'L',
        sugarLevel: '70%',
        iceLevel: '50%',
        toppings: ['pearl', 'pudding'],
      },
      {
        productName: 'Peach Oolong Tea',
        quantity: 1,
        size: 'M',
        sugarLevel: '50%',
        iceLevel: '50%',
        toppings: ['aloe'],
      },
    ],
  },
  {
    customerEmail: 'customer2@example.com',
    customerName: 'Customer Two',
    phone: '0912345678',
    address: 'Da Nang',
    status: 'PROCESSING',
    items: [
      {
        productName: 'Classic Milk Tea',
        quantity: 1,
        size: 'M',
        sugarLevel: '100%',
        iceLevel: '70%',
        toppings: ['pearl'],
      },
      {
        productName: 'Americano',
        quantity: 1,
        size: 'M',
        sugarLevel: '100%',
        iceLevel: '70%',
      },
    ],
  },
];

function assertCondition(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function seedAll() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'user',
    password: process.env.DB_PASSWORD ?? 'password',
    database: process.env.DB_NAME ?? 'drink_order_app',
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    await dataSource.transaction(async (manager) => {
      const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@drinkapp.local';
      const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
      const adminName = process.env.ADMIN_NAME ?? 'System Admin';
      const customerPassword = process.env.CUSTOMER_PASSWORD ?? 'secret123';

      const adminHash = await bcrypt.hash(adminPassword, 10);
      const customerHash = await bcrypt.hash(customerPassword, 10);

      await manager.query(
        `
        INSERT INTO users (name, email, password, role)
        VALUES ($1, $2, $3, 'admin')
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          updated_at = NOW()
      `,
        [adminName, adminEmail, adminHash],
      );

      const customerSeeds = [
        ['Customer One', 'customer1@example.com'],
        ['Customer Two', 'customer2@example.com'],
      ] as const;

      for (const customer of customerSeeds) {
        await manager.query(
          `
          INSERT INTO users (name, email, password, role)
          VALUES ($1, $2, $3, 'customer')
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            password = EXCLUDED.password,
            role = EXCLUDED.role,
            updated_at = NOW()
        `,
          [customer[0], customer[1], customerHash],
        );
      }

      const categoryIdByName = new Map<string, number>();
      for (const category of categories) {
        const existing = await manager.query(
          'SELECT id FROM categories WHERE name = $1 LIMIT 1',
          [category.name],
        );

        if (existing.length > 0) {
          await manager.query(
            'UPDATE categories SET description = $1 WHERE id = $2',
            [category.description, existing[0].id],
          );
          categoryIdByName.set(category.name, Number(existing[0].id));
          continue;
        }

        const inserted = await manager.query(
          'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id',
          [category.name, category.description],
        );
        categoryIdByName.set(category.name, Number(inserted[0].id));
      }

      const productPriceByName = new Map<string, number>();
      for (const product of products) {
        const categoryId = categoryIdByName.get(product.categoryName);
        assertCondition(
          typeof categoryId !== 'undefined',
          `Category not found for product ${product.name}`,
        );

        const existing = await manager.query(
          'SELECT id FROM products WHERE name = $1 AND category_id = $2 LIMIT 1',
          [product.name, categoryId],
        );

        if (existing.length > 0) {
          await manager.query(
            'UPDATE products SET price = $1, image_url = $2 WHERE id = $3',
            [product.price, product.imageUrl, existing[0].id],
          );
        } else {
          await manager.query(
            'INSERT INTO products (name, price, image_url, category_id) VALUES ($1, $2, $3, $4)',
            [product.name, product.price, product.imageUrl, categoryId],
          );
        }

        productPriceByName.set(product.name, product.price);
      }

      for (const orderSeed of orders) {
        const userRows = await manager.query(
          'SELECT id FROM users WHERE email = $1 LIMIT 1',
          [orderSeed.customerEmail],
        );
        assertCondition(userRows.length === 1, `User not found for ${orderSeed.customerEmail}`);

        const userId = Number(userRows[0].id);

        const existingOrderRows = await manager.query(
          `
          SELECT id FROM orders
          WHERE user_id = $1 AND customer_name = $2 AND phone = $3
          ORDER BY id ASC
          LIMIT 1
        `,
          [userId, orderSeed.customerName, orderSeed.phone],
        );

        let orderId: number;
        if (existingOrderRows.length > 0) {
          orderId = Number(existingOrderRows[0].id);
          await manager.query(
            'UPDATE orders SET address = $1, status = $2 WHERE id = $3',
            [orderSeed.address, orderSeed.status, orderId],
          );
        } else {
          const insertedOrder = await manager.query(
            `
            INSERT INTO orders (user_id, customer_name, phone, address, total_amount, status)
            VALUES ($1, $2, $3, $4, 0, $5)
            RETURNING id
          `,
            [
              userId,
              orderSeed.customerName,
              orderSeed.phone,
              orderSeed.address,
              orderSeed.status,
            ],
          );
          orderId = Number(insertedOrder[0].id);
        }

        const countItems = await manager.query(
          'SELECT COUNT(*)::int AS count FROM order_items WHERE order_id = $1',
          [orderId],
        );

        if (Number(countItems[0].count) === 0) {
          for (const item of orderSeed.items) {
            const productRows = await manager.query(
              'SELECT id, price FROM products WHERE name = $1 LIMIT 1',
              [item.productName],
            );
            assertCondition(productRows.length === 1, `Product not found for ${item.productName}`);

            const productId = Number(productRows[0].id);
            const unitPrice = Number(productRows[0].price);
            const linePrice = Number((unitPrice * item.quantity).toFixed(2));
            const toppings = item.toppings?.length ? item.toppings.join(',') : null;

            await manager.query(
              `
              INSERT INTO order_items
                (order_id, product_id, quantity, size, sugar_level, ice_level, toppings, price)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `,
              [
                orderId,
                productId,
                item.quantity,
                item.size ?? null,
                item.sugarLevel ?? null,
                item.iceLevel ?? null,
                toppings,
                linePrice,
              ],
            );
          }
        }

        await manager.query(
          `
          UPDATE orders o
          SET total_amount = totals.total
          FROM (
            SELECT order_id, COALESCE(SUM(price), 0)::NUMERIC(10,2) AS total
            FROM order_items
            WHERE order_id = $1
            GROUP BY order_id
          ) totals
          WHERE o.id = totals.order_id
        `,
          [orderId],
        );
      }

      const [usersCount] = await manager.query('SELECT COUNT(*)::int AS count FROM users');
      const [categoriesCount] = await manager.query(
        'SELECT COUNT(*)::int AS count FROM categories',
      );
      const [productsCount] = await manager.query('SELECT COUNT(*)::int AS count FROM products');
      const [ordersCount] = await manager.query('SELECT COUNT(*)::int AS count FROM orders');
      const [orderItemsCount] = await manager.query(
        'SELECT COUNT(*)::int AS count FROM order_items',
      );

      assertCondition(Number(usersCount.count) >= 3, 'Seed verify failed: users < 3');
      assertCondition(Number(categoriesCount.count) >= 4, 'Seed verify failed: categories < 4');
      assertCondition(Number(productsCount.count) >= 6, 'Seed verify failed: products < 6');
      assertCondition(Number(ordersCount.count) >= 2, 'Seed verify failed: orders < 2');
      assertCondition(
        Number(orderItemsCount.count) >= 4,
        'Seed verify failed: order_items < 4',
      );

      const [badProducts] = await manager.query(
        'SELECT COUNT(*)::int AS count FROM products WHERE price <= 0 OR category_id IS NULL',
      );
      assertCondition(
        Number(badProducts.count) === 0,
        'Seed verify failed: invalid products found',
      );

      const [badTotals] = await manager.query(
        `
        SELECT COUNT(*)::int AS count FROM (
          SELECT o.id,
                 o.total_amount,
                 COALESCE(SUM(oi.price), 0)::NUMERIC(10,2) AS items_total
          FROM orders o
          LEFT JOIN order_items oi ON oi.order_id = o.id
          GROUP BY o.id
        ) t
        WHERE t.total_amount <> t.items_total
      `,
      );
      assertCondition(
        Number(badTotals.count) === 0,
        'Seed verify failed: order total mismatch detected',
      );
    });

    console.log('Seed all completed and verified successfully.');
  } finally {
    await dataSource.destroy();
  }
}

seedAll().catch((error: unknown) => {
  console.error('Seed all failed:', error);
  process.exit(1);
});
