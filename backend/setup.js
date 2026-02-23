/**
 * Auto-setup script: creates the database and tables if they don't exist.
 * Run automatically on server start — no manual phpMyAdmin steps needed.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function setup() {
    // Connect WITHOUT specifying a database first so we can create it
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
    });

    const db = process.env.DB_NAME || 'drive_prime';

    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${db}\``);
    await conn.query(`USE \`${db}\``);

    // ── listings table ──────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS listings (
            id          VARCHAR(36)  PRIMARY KEY,
            brand       VARCHAR(100),
            model       VARCHAR(100),
            variant     VARCHAR(100),
            type        VARCHAR(50)  DEFAULT 'Car',
            year        SMALLINT,
            km          INT,
            fuel        VARCHAR(50),
            transmission VARCHAR(50),
            ownership   VARCHAR(50),
            insurance   VARCHAR(100),
            color       VARCHAR(100),
            state       VARCHAR(100),
            city        VARCHAR(100),
            location    VARCHAR(200),
            about       TEXT,
            price       BIGINT,
            images      JSON,
            dealer_name     VARCHAR(200),
            dealer_phone    VARCHAR(20),
            dealer_email    VARCHAR(200),
            dealer_whatsapp VARCHAR(20),
            status      VARCHAR(20)  DEFAULT 'live',
            featured    TINYINT(1)   DEFAULT 0,
            created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ── pending_listings table ───────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS pending_listings (
            id          VARCHAR(36)  PRIMARY KEY,
            brand       VARCHAR(100),
            model       VARCHAR(100),
            variant     VARCHAR(100),
            type        VARCHAR(50)  DEFAULT 'Car',
            year        SMALLINT,
            km          INT,
            fuel        VARCHAR(50),
            transmission VARCHAR(50),
            ownership   VARCHAR(50),
            insurance   VARCHAR(100),
            color       VARCHAR(100),
            state       VARCHAR(100),
            city        VARCHAR(100),
            location    VARCHAR(200),
            about       TEXT,
            price       BIGINT,
            images      JSON,
            dealer_name     VARCHAR(200),
            dealer_phone    VARCHAR(20),
            dealer_email    VARCHAR(200),
            dealer_whatsapp VARCHAR(20),
            submitted_at VARCHAR(50),
            created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ── brands table ─────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS brands (
            id         INT          AUTO_INCREMENT PRIMARY KEY,
            name       VARCHAR(100) NOT NULL UNIQUE,
            type       VARCHAR(20)  DEFAULT 'both',
            logo_url   VARCHAR(500) DEFAULT '',
            created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed default brands if table is empty
    const [existing] = await conn.query('SELECT COUNT(*) as cnt FROM brands');
    if (existing[0].cnt === 0) {
        const defaultBrands = [
            ['Maruti Suzuki', 'car'], ['Hyundai', 'car'], ['Honda', 'both'],
            ['Toyota', 'car'], ['Tata', 'car'], ['Mahindra', 'car'],
            ['Kia', 'car'], ['MG', 'car'], ['Volkswagen', 'car'], ['Skoda', 'car'],
            ['Ford', 'car'], ['Renault', 'car'], ['Nissan', 'car'], ['Jeep', 'car'],
            ['BMW', 'car'], ['Mercedes-Benz', 'car'], ['Audi', 'car'],
            ['Royal Enfield', 'bike'], ['Bajaj', 'bike'], ['Hero', 'bike'],
            ['TVS', 'bike'], ['KTM', 'bike'], ['Yamaha', 'bike'], ['Suzuki', 'both'],
            ['Kawasaki', 'bike'],
        ];
        for (const [name, type] of defaultBrands) {
            await conn.query('INSERT IGNORE INTO brands (name, type) VALUES (?, ?)', [name, type]);
        }
    }

    // ── users table ──────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
            id           VARCHAR(36)  PRIMARY KEY,
            name         VARCHAR(200) NOT NULL,
            email        VARCHAR(200) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role         VARCHAR(20)  DEFAULT 'customer',
            phone        VARCHAR(20)  DEFAULT '',
            created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed developer + default admin accounts if users table is empty
    const [userCount] = await conn.query('SELECT COUNT(*) as cnt FROM users');
    if (userCount[0].cnt === 0) {
        const bcrypt = require('bcryptjs');
        const crypto = require('crypto');
        const accounts = [
            { name: 'Developer', email: process.env.DEV_EMAIL || 'dev@driveprime.in', password: process.env.DEV_PASS || 'dev123', role: 'developer' },
            { name: 'Admin', email: process.env.ADMIN_EMAIL || 'admin@driveprime.in', password: process.env.ADMIN_PASS || 'admin123', role: 'admin' },
        ];
        for (const acc of accounts) {
            const hash = await bcrypt.hash(acc.password, 10);
            await conn.query(
                'INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES (?,?,?,?,?)',
                [crypto.randomUUID(), acc.name, acc.email, hash, acc.role]
            );
        }
        console.log('👤  Default dev & admin accounts created.');
    }

    // ── feature_flags table ──────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS feature_flags (
            \`key\`       VARCHAR(100) PRIMARY KEY,
            value        TINYINT(1)   DEFAULT 0,
            description  VARCHAR(300) DEFAULT '',
            updated_by   VARCHAR(200) DEFAULT '',
            updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Seed default flags
    const defaultFlags = [
        ['allow_customer_selling', 0, 'Allow customers to submit their own vehicles for sale'],
        ['maintenance_mode', 0, 'Show a maintenance banner across the site'],
    ];
    for (const [key, value, description] of defaultFlags) {
        await conn.query(
            'INSERT IGNORE INTO feature_flags (`key`, value, description) VALUES (?,?,?)',
            [key, value, description]
        );
    }

    console.log(`✅  Database "${db}" and tables are ready.`);
    await conn.end();
}

module.exports = setup;
