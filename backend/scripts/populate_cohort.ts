import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Calculating cohorts...");

  // Clear existing cohorts
  await prisma.cohort.deleteMany({});

  const sql = `
    WITH customer_cohort AS (
        SELECT 
            customerId,
            DATE_FORMAT(MIN(transactionDate), '%Y-%m') AS cohort_month
        FROM Transaction
        WHERE status = 'Success'
        GROUP BY customerId
    ),
    cohort_activity AS (
        SELECT DISTINCT
            customerId,
            DATE_FORMAT(transactionDate, '%Y-%m') AS activity_month
        FROM Transaction
        WHERE status = 'Success'
    )
    SELECT 
        cc.customerId,
        cc.cohort_month AS cohortMonth,
        ca.activity_month AS activeMonth
    FROM customer_cohort cc
    JOIN cohort_activity ca ON cc.customerId = ca.customerId
  `;

  const results: any[] = await prisma.$queryRawUnsafe(sql);

  console.log(`Found ${results.length} cohort records. Inserting...`);
  
  const formattedData = results.map(row => ({
    customerId: row.customerId,
    cohortMonth: row.cohortMonth,
    activeMonth: row.activeMonth,
    retained: true
  }));

  await prisma.cohort.createMany({
    data: formattedData
  });

  console.log("Cohort table populated successfully!");
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
