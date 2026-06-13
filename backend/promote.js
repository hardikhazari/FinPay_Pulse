const mariadb = require('mariadb');

async function main() {
  console.log("Connecting directly...");
  const pool = mariadb.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Hardik@123',
    database: 'finpay_pulse',
    connectionLimit: 1
  });

  try {
    const users = await pool.query("SELECT * FROM User");
    console.log("Found users:", users.length);
    
    if (users.length > 0) {
      const res = await pool.query("UPDATE User SET role = 'admin' LIMIT 1");
      console.log("User successfully promoted to admin. Result:", res);
    } else {
      console.log("User table is empty.");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}
main();
