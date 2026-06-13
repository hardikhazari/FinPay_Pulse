const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');
require('dotenv').config();

async function main() {
  console.log("Testing Prisma connection...");
  const rawUrl = process.env.DATABASE_URL.replace(/^mariadb:/, 'http:').replace(/^mysql:/, 'http:');
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

  try {
    const users = await prisma.user.findMany();
    console.log("Prisma found users:", users.length);
  } catch (err) {
    console.error("PRISMA ERROR:", err);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}
main();
