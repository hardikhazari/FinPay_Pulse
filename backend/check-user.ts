import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';

const dbUrl = new URL(process.env.DATABASE_URL!);
const pool = mariadb.createPool({
  host: dbUrl.hostname,
  port: dbUrl.port ? parseInt(dbUrl.port) : 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.slice(1),
  connectionLimit: 1
});
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:", users);
  
  if (users.length > 0) {
    // If there is a user, let's promote the first one to admin!
    const updated = await prisma.user.update({
      where: { id: users[0].id },
      data: { role: 'admin' }
    });
    console.log("Promoted user to admin:", updated);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
