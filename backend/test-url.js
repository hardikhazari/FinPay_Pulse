require('dotenv').config();
const rawUrl = process.env.DATABASE_URL.replace(/^mariadb:/, 'http:').replace(/^mysql:/, 'http:');
console.log("Raw URL:", rawUrl);
const dbUrl = new URL(rawUrl);
console.log("Parsed URL:", dbUrl);
console.log("Username:", decodeURIComponent(dbUrl.username));
console.log("Password:", decodeURIComponent(dbUrl.password));
