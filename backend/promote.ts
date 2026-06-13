import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';

const rawUrl = process.env.DATABASE_URL!.replace(/^mariadb:/, 'http:');
const dbUrl = new URL(rawUrl);
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
  console.log("Found users:", users.length);
  if (users.length > 0) {
    const res = await prisma.user.update({
      where: { id: users[0].id },
      data: { role: 'admin' }
    });
    console.log("Updated user:", res);
  } else {
    console.log("No users found in database yet. The API must not have been triggered.");
  }
}

main().catch(console.error).finally(() => process.exit(0));
