import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.customer.count();
  console.log("Customer count:", count);
}

main().catch(e => {
  console.error("ERROR:", e);
}).finally(() => prisma.$disconnect());
