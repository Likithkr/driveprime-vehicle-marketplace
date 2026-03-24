require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'drive_prime',
    max: 10,
    idleTimeoutMillis: 60000,
});

/**
 * Wrapper that mimics mysql2's [rows, fields] return format so all routes
 * can keep the same `const [rows] = await db.query(...)` destructuring pattern.
 */
async function query(sql, params) {
    const result = await pool.query(sql, params);
    return [result.rows, result];
}

/**
 * Transaction helper — mimics mysql2's pool.getConnection() API.
 * Returns a client with beginTransaction / commit / rollback / release / query.
 */
async function getConnection() {
    const client = await pool.connect();
    return {
        query: async (sql, params) => {
            const result = await client.query(sql, params);
            return [result.rows, result];
        },
        beginTransaction: () => client.query('BEGIN'),
        commit: () => client.query('COMMIT'),
        rollback: () => client.query('ROLLBACK'),
        release: () => client.release(),
    };
}

module.exports = { query, getConnection };
