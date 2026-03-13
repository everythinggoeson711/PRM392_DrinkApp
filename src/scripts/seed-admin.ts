import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

async function seedAdmin() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'user',
    password: process.env.DB_PASSWORD ?? 'password',
    database: process.env.DB_NAME ?? 'drink_order_app',
    entities: [User],
    synchronize: false,
  });

  await dataSource.initialize();

  try {
    const userRepository = dataSource.getRepository(User);
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@drinkapp.local';
    const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
    const adminName = process.env.ADMIN_NAME ?? 'System Admin';

    const existing = await userRepository.findOne({ where: { email: adminEmail } });
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await userRepository.save(existing);
      }
      console.log(`Admin already exists: ${adminEmail}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = userRepository.create({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    await userRepository.save(admin);
    console.log(`Created admin account: ${adminEmail}`);
  } finally {
    await dataSource.destroy();
  }
}

seedAdmin().catch((error: unknown) => {
  console.error('Failed to seed admin:', error);
  process.exit(1);
});
