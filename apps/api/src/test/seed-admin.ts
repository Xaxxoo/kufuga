import 'reflect-metadata';
import { hash } from 'bcryptjs';
import { AppDataSource } from '../database/data-source';
import { UserEntity } from '../database/entities';

async function seed(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@kufuga.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'change-this-admin-password';
  await AppDataSource.initialize();
  const users = AppDataSource.getRepository(UserEntity);
  const user = await users.findOneBy({ email });
  await users.save(users.create({ ...(user ?? {}), id: user?.id, email, passwordHash: await hash(password, 12), phone: user?.phone ?? '+0000000000', pinHash: user?.pinHash ?? await hash(password, 10), role: 'admin', farmId: null }));
  await AppDataSource.destroy();
  console.log(`Seeded admin ${email}`);
}
void seed().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
