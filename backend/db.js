require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'LikithKeremane@01',
    database: process.env.DB_NAME || 'drive_prime',
    waitForConnections: true,
    connectionLimit: 10,
    // Allow large payloads (base64 images from customer submissions)
    // Default MySQL max_allowed_packet is only 4MB which breaks multi-image uploads
    connectTimeout: 60000,
});

// Bump max_allowed_packet to 64MB globally (MySQL 8+ removed session-level support for this variable)
pool.query("SET GLOBAL max_allowed_packet = 67108864").catch(() => {
    // Non-fatal: requires SUPER privilege. If it fails, large uploads may hit the default 4MB limit.
    console.warn('[db] Could not set max_allowed_packet globally — large image uploads may fail.');
});

module.exports = pool;
