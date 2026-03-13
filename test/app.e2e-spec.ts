import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ExecutionContext } from '@nestjs/common';

import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { CategoriesController } from '../src/categories/categories.controller';
import { CategoriesService } from '../src/categories/categories.service';
import { ProductsController } from '../src/products/products.controller';
import { ProductsService } from '../src/products/products.service';
import { OrdersController } from '../src/orders/orders.controller';
import { OrdersService } from '../src/orders/orders.service';
import { PaymentsController } from '../src/payments/payments.controller';
import { PaymentsService } from '../src/payments/payments.service';

import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';

describe('Vương Quốc Test E2E (Tất cả APIs)', () => {
  let app: INestApplication;

  // -- Services Mock --
  const authServiceMock = {
    register: jest.fn().mockImplementation((dto) => ({ id: 1, name: dto.name, email: dto.email, role: 'customer' })),
    login: jest.fn().mockResolvedValue({
      accessToken: 'fake-jwt-token',
      user: { id: 1, name: 'Test', email: 'test@example.com', role: 'customer' },
    }),
  };

  const usersServiceMock = {
    create: jest.fn().mockImplementation((dto) => ({ id: 2, ...dto })),
    findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Admin', email: 'admin@drinkapp.local' }]),
    findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Admin', email: 'admin@drinkapp.local' }),
    update: jest.fn().mockImplementation((id, dto) => ({ id, ...dto })),
    remove: jest.fn().mockResolvedValue(true),
  };

  const categoriesServiceMock = {
    create: jest.fn().mockImplementation((dto) => ({ id: 2, ...dto })),
    findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Coffee', description: 'desc' }]),
    findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Coffee', description: 'desc' }),
    update: jest.fn().mockImplementation((id, dto) => ({ id, name: 'Coffee Updated', ...dto })),
    remove: jest.fn().mockResolvedValue(true),
  };

  const productsServiceMock = {
    create: jest.fn().mockImplementation((dto) => ({ id: 2, ...dto })),
    findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'Latte', price: 50000, categoryId: 1 }]),
    findOne: jest.fn().mockResolvedValue({ id: 1, name: 'Latte', price: 50000, categoryId: 1 }),
    update: jest.fn().mockImplementation((id, dto) => ({ id, ...dto })),
    remove: jest.fn().mockResolvedValue(true),
    updateImage: jest.fn().mockResolvedValue({ imageUrl: '/uploads/test.png' }),
  };

  const ordersServiceMock = {
    create: jest.fn().mockImplementation((dto) => ({
      id: 101, customerName: dto.customerName, status: 'PENDING', items: dto.items, totalAmount: 100000,
    })),
    findAll: jest.fn().mockResolvedValue([{ id: 101, customerName: 'Bao', status: 'PENDING', totalAmount: 100000 }]),
    findOne: jest.fn().mockResolvedValue({ id: 101, customerName: 'Bao', status: 'PENDING', totalAmount: 100000 }),
    updateStatus: jest.fn().mockImplementation((id, dto) => ({ id, status: dto.status, totalAmount: 100000 })),
  };

  const paymentsServiceMock = {
    createForOrder: jest.fn().mockResolvedValue({
      id: 1, orderId: 101, paymentCode: 'DRK101', amount: 100000, status: 'PENDING', qrUrl: 'http://qr'
    }),
    findByOrder: jest.fn().mockResolvedValue({ id: 1, orderId: 101, status: 'PAID' }),
    handleWebhook: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        AuthController, 
        UsersController,
        CategoriesController, 
        ProductsController, 
        OrdersController, 
        PaymentsController
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: CategoriesService, useValue: categoriesServiceMock },
        { provide: ProductsService, useValue: productsServiceMock },
        { provide: OrdersService, useValue: ordersServiceMock },
        { provide: PaymentsService, useValue: paymentsServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ 
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          // inject a fake user for /auth/profile and guards
          req.user = { id: 1, email: 'admin@drinkapp.local', role: 'admin' };
          return true;
        } 
      })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ==========================================
  // AUTH
  // ==========================================
  describe('Auth', () => {
    it('POST /auth/register', async () => {
      const res = await request(app.getHttpServer()).post('/auth/register').send({ name: 'Test', email: 'test@example.com', password: 'pwd' }).expect(201);
      expect(res.body).toHaveProperty('id');
    });

    it('POST /auth/login', async () => {
      const res = await request(app.getHttpServer()).post('/auth/login').send({ email: 'test@example.com', password: 'pwd' }).expect(201);
      expect(res.body).toHaveProperty('accessToken');
    });

    it('GET /auth/profile', async () => {
      const res = await request(app.getHttpServer()).get('/auth/profile').expect(200);
      expect(res.body.email).toBe('admin@drinkapp.local');
    });
  });

  // ==========================================
  // USERS
  // ==========================================
  describe('Users', () => {
    it('POST /users', async () => {
      const res = await request(app.getHttpServer()).post('/users').send({ name: 'NewUser', email: 'new@example.com', password: '123' }).expect(201);
      expect(res.body.name).toBe('NewUser');
    });
    it('GET /users', async () => {
      const res = await request(app.getHttpServer()).get('/users').expect(200);
      expect(res.body).toHaveLength(1);
    });
    it('GET /users/:id', async () => {
      const res = await request(app.getHttpServer()).get('/users/1').expect(200);
      expect(res.body.id).toBe(1);
    });
    it('PATCH /users/:id', async () => {
      const res = await request(app.getHttpServer()).patch('/users/1').send({ name: 'Updated' }).expect(200);
      expect(res.body.name).toBe('Updated');
    });
    it('DELETE /users/:id', async () => {
      await request(app.getHttpServer()).delete('/users/1').expect(204);
    });
  });

  // ==========================================
  // CATEGORIES
  // ==========================================
  describe('Categories', () => {
    it('POST /categories', async () => {
      const res = await request(app.getHttpServer()).post('/categories').send({ name: 'Tea' }).expect(201);
      expect(res.body.name).toBe('Tea');
    });
    it('GET /categories', async () => {
      const res = await request(app.getHttpServer()).get('/categories').expect(200);
      expect(res.body).toHaveLength(1);
    });
    it('GET /categories/:id', async () => {
      const res = await request(app.getHttpServer()).get('/categories/1').expect(200);
      expect(res.body.id).toBe(1);
    });
    it('PATCH /categories/:id', async () => {
      const res = await request(app.getHttpServer()).patch('/categories/1').send({ name: 'Tea Updated' }).expect(200);
      expect(res.body.name).toBe('Tea Updated');
    });
    it('DELETE /categories/:id', async () => {
      await request(app.getHttpServer()).delete('/categories/1').expect(204);
    });
  });

  // ==========================================
  // PRODUCTS
  // ==========================================
  describe('Products', () => {
    it('POST /products', async () => {
      const res = await request(app.getHttpServer()).post('/products').send({ name: 'Milk Tea', price: 30000 }).expect(201);
      expect(res.body.name).toBe('Milk Tea');
    });
    it('GET /products', async () => {
      const res = await request(app.getHttpServer()).get('/products').expect(200);
      expect(res.body).toHaveLength(1);
    });
    it('GET /products/:id', async () => {
      const res = await request(app.getHttpServer()).get('/products/1').expect(200);
      expect(res.body.id).toBe(1);
    });
    it('PATCH /products/:id', async () => {
      const res = await request(app.getHttpServer()).patch('/products/1').send({ price: 40000 }).expect(200);
      expect(res.body.price).toBe(40000);
    });
    it('DELETE /products/:id', async () => {
      await request(app.getHttpServer()).delete('/products/1').expect(204);
    });
    
    // image endpoints mock
    it('POST /products/upload-image', async () => {
      const res = await request(app.getHttpServer())
        .post('/products/upload-image')
        .attach('image', Buffer.from('fake image content'), 'test.png')
        .expect(201);
      // because we mocked updateImage, but wait, POST /upload-image doesn't use productsService.updateImage!
      // In the controller, POST /upload-image returns immediately `imageUrl: \`/uploads/products/${file.filename}\``
      // Wait, let's see. If the DTO or interceptor doesn't throw.
      expect(res.body).toHaveProperty('imageUrl');
    });
    it('PATCH /products/:id/image', async () => {
      const res = await request(app.getHttpServer())
        .patch('/products/1/image')
        .attach('image', Buffer.from('fake image content'), 'test.png')
        .expect(200);
      expect(res.body).toHaveProperty('imageUrl');
    });
  });

  // ==========================================
  // ORDERS
  // ==========================================
  describe('Orders', () => {
    it('POST /orders', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders')
        .send({ customerName: 'Bao', phone: '0901234567', items: [{ productId: 1, quantity: 2, price: 50000 }] })
        .expect(201);
      expect(res.body.status).toBe('PENDING');
    });
    it('GET /orders', async () => {
      const res = await request(app.getHttpServer()).get('/orders').expect(200);
      expect(res.body).toHaveLength(1);
    });
    it('GET /orders/:id', async () => {
      const res = await request(app.getHttpServer()).get('/orders/101').expect(200);
      expect(res.body.id).toBe(101);
    });
    it('PATCH /orders/:id/status', async () => {
      const res = await request(app.getHttpServer()).patch('/orders/101/status').send({ status: 'PROCESSING' }).expect(200);
      expect(res.body.status).toBe('PROCESSING');
    });
  });

  // ==========================================
  // PAYMENTS
  // ==========================================
  describe('Payments', () => {
    it('POST /payments', async () => {
      const res = await request(app.getHttpServer()).post('/payments').send({ orderId: 101 }).expect(201);
      expect(res.body.paymentCode).toBe('DRK101');
    });
    it('GET /payments/order/:orderId', async () => {
      const res = await request(app.getHttpServer()).get('/payments/order/101').expect(200);
      expect(res.body.status).toBe('PAID');
    });
    it('POST /payments/webhook/sepay', async () => {
      const res = await request(app.getHttpServer())
        .post('/payments/webhook/sepay')
        .set('Authorization', 'Apikey dummy')
        .send({ transferType: 'in', transferAmount: 100000, content: 'DRK101', id: 1, gateway: 'MB', transactionDate: '2026', accountNumber: '123' })
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });
});
