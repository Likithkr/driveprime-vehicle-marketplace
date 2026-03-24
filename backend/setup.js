/**
 * Auto-setup script: creates the PostgreSQL database and tables if they don't exist.
 * Run automatically on server start — no manual steps needed.
 */
require('dotenv').config();
const { Client } = require('pg');

async function setup() {
    const dbName = process.env.DB_NAME || 'drive_prime';
    const connBase = {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || '',
    };

    // ── Step 1: Create the database if it doesn't exist ──────────────────────
    const adminConn = new Client({ ...connBase, database: 'postgres' });
    await adminConn.connect();
    const { rows: dbExists } = await adminConn.query(
        'SELECT 1 FROM pg_database WHERE datname = $1', [dbName]
    );
    if (dbExists.length === 0) {
        await adminConn.query(`CREATE DATABASE "${dbName}"`);
        console.log(`📦  Database "${dbName}" created.`);
    }
    await adminConn.end();

    // ── Step 2: Connect to the target database ────────────────────────────────
    const conn = new Client({ ...connBase, database: dbName });
    await conn.connect();

    // ── listings table ────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS listings (
            id              VARCHAR(36)  PRIMARY KEY,
            brand           VARCHAR(100),
            model           VARCHAR(100),
            variant         VARCHAR(100),
            type            VARCHAR(50)  DEFAULT 'Car',
            year            SMALLINT,
            km              INT,
            fuel            VARCHAR(50),
            transmission    VARCHAR(50),
            ownership       VARCHAR(50),
            insurance       VARCHAR(100),
            color           VARCHAR(100),
            state           VARCHAR(100),
            city            VARCHAR(100),
            location        VARCHAR(200),
            about           TEXT,
            price           BIGINT,
            images          TEXT,
            dealer_name     VARCHAR(200),
            dealer_phone    VARCHAR(20),
            dealer_email    VARCHAR(200),
            dealer_whatsapp VARCHAR(20),
            status          VARCHAR(20)  DEFAULT 'live',
            featured        BOOLEAN      DEFAULT FALSE,
            created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ── dealerships table ─────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS dealerships (
            id          VARCHAR(36)  PRIMARY KEY,
            name        VARCHAR(200) NOT NULL,
            type        VARCHAR(20)  DEFAULT 'drive_prime',
            address     VARCHAR(300) DEFAULT '',
            city        VARCHAR(100) DEFAULT '',
            state       VARCHAR(100) DEFAULT '',
            phone       VARCHAR(20)  DEFAULT '',
            email       VARCHAR(200) DEFAULT '',
            created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed default dealerships if table is empty
    const dealerCount = await conn.query('SELECT COUNT(*) AS cnt FROM dealerships');
    if (parseInt(dealerCount.rows[0].cnt) === 0) {
        const crypto2 = require('crypto');
        const defaultDealerships = [
            { name: 'Drive Prime — Kochi (Main)', address: 'Marine Drive, Ernakulam', city: 'Kochi', state: 'Kerala', phone: '+91 80000 00001', email: 'kochi@driveprime.in' },
            { name: 'Drive Prime — Trivandrum', address: 'MG Road, Palayam', city: 'Thiruvananthapuram', state: 'Kerala', phone: '+91 80000 00002', email: 'trivandrum@driveprime.in' },
            { name: 'Drive Prime — Calicut', address: 'SM Street, Kozhikode', city: 'Kozhikode', state: 'Kerala', phone: '+91 80000 00003', email: 'calicut@driveprime.in' },
        ];
        for (const d of defaultDealerships) {
            await conn.query(
                'INSERT INTO dealerships (id, name, type, address, city, state, phone, email) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
                [crypto2.randomUUID(), d.name, 'drive_prime', d.address, d.city, d.state, d.phone, d.email]
            );
        }
        console.log('🏢  Default dealerships seeded.');
    }

    // ── pending_listings table ────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS pending_listings (
            id              VARCHAR(36)  PRIMARY KEY,
            brand           VARCHAR(100),
            model           VARCHAR(100),
            variant         VARCHAR(100),
            type            VARCHAR(50)  DEFAULT 'Car',
            year            SMALLINT,
            km              INT,
            fuel            VARCHAR(50),
            transmission    VARCHAR(50),
            ownership       VARCHAR(50),
            insurance       VARCHAR(100),
            color           VARCHAR(100),
            state           VARCHAR(100),
            city            VARCHAR(100),
            location        VARCHAR(200),
            about           TEXT,
            price           BIGINT,
            images          TEXT,
            dealer_name     VARCHAR(200),
            dealer_phone    VARCHAR(20),
            dealer_email    VARCHAR(200),
            dealer_whatsapp VARCHAR(20),
            submitted_at    VARCHAR(50),
            created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ── brands table ──────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS brands (
            id         INT          GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name       VARCHAR(100) NOT NULL UNIQUE,
            type       VARCHAR(20)  DEFAULT 'both',
            logo_url   VARCHAR(500) DEFAULT '',
            created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed default brands if table is empty
    const existing = await conn.query('SELECT COUNT(*) AS cnt FROM brands');
    if (parseInt(existing.rows[0].cnt) === 0) {
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
            await conn.query(
                'INSERT INTO brands (name, type) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
                [name, type]
            );
        }
    }

    // ── users table ───────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
            id               VARCHAR(36)  PRIMARY KEY,
            name             VARCHAR(200) NOT NULL,
            email            VARCHAR(200) NOT NULL UNIQUE,
            password_hash    VARCHAR(255) NOT NULL,
            role             VARCHAR(20)  DEFAULT 'customer',
            phone            VARCHAR(20)  DEFAULT '',
            reset_otp        VARCHAR(10)  DEFAULT NULL,
            reset_otp_expiry TIMESTAMP    DEFAULT NULL,
            created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Safely add OTP columns to existing users tables (IF NOT EXISTS — PG 9.6+)
    await conn.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(10) DEFAULT NULL');
    await conn.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_expiry TIMESTAMP DEFAULT NULL');

    // Seed developer + default admin accounts if users table is empty
    const userCount = await conn.query('SELECT COUNT(*) AS cnt FROM users');
    if (parseInt(userCount.rows[0].cnt) === 0) {
        const bcrypt = require('bcryptjs');
        const crypto = require('crypto');
        const accounts = [
            { name: 'Developer', email: process.env.DEV_EMAIL || 'dev@driveprime.in', password: process.env.DEV_PASS || 'dev123', role: 'developer' },
            { name: 'Admin', email: process.env.ADMIN_EMAIL || 'admin@driveprime.in', password: process.env.ADMIN_PASS || 'admin123', role: 'admin' },
        ];
        for (const acc of accounts) {
            const hash = await bcrypt.hash(acc.password, 10);
            await conn.query(
                'INSERT INTO users (id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
                [crypto.randomUUID(), acc.name, acc.email, hash, acc.role]
            );
        }
        console.log('👤  Default dev & admin accounts created.');
    }

    // ── feature_flags table ───────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS feature_flags (
            "key"       VARCHAR(100) PRIMARY KEY,
            value       BOOLEAN      DEFAULT FALSE,
            description VARCHAR(300) DEFAULT '',
            updated_by  VARCHAR(200) DEFAULT '',
            updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed default flags
    const defaultFlags = [
        ['allow_customer_selling', false, 'Allow customers to submit their own vehicles for sale'],
        ['maintenance_mode', false, 'Show a maintenance banner across the site'],
    ];
    for (const [key, value, description] of defaultFlags) {
        await conn.query(
            'INSERT INTO feature_flags ("key", value, description) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
            [key, value, description]
        );
    }

    // ── settings table ────────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS settings (
            "key"       VARCHAR(100) PRIMARY KEY,
            value       TEXT,
            description VARCHAR(300) DEFAULT '',
            updated_by  VARCHAR(200) DEFAULT '',
            updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed default settings
    const defaultSettings = [
        ['site_logo', '/drive-prime-logo.png', 'URL or path to the main site logo badge'],
        ['dealer_phone', '+91 80000 00000', 'Main contact phone number for the dealership'],
        ['dealer_email', 'support@driveprime.in', 'Main contact email address'],
        ['dealer_whatsapp', '+918000000000', 'WhatsApp number (include country code, no spaces)'],
        ['dealer_address', 'Drive Prime HQ, Marine Drive, Kochi — 682031, Kerala, India', 'Physical address shown in footer and contact pages'],
        ['brand_name', 'Drive Prime', 'Name of the business, used in alt tags and titles'],
    ];
    for (const [key, value, description] of defaultSettings) {
        await conn.query(
            'INSERT INTO settings ("key", value, description) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
            [key, value, description]
        );
    }

    // ── appointments table ────────────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS appointments (
            id                  VARCHAR(36)  PRIMARY KEY,
            listing_id          VARCHAR(36)  NOT NULL,
            car_name            VARCHAR(300),
            user_id             VARCHAR(36)  NOT NULL,
            customer_name       VARCHAR(200) NOT NULL,
            customer_email      VARCHAR(200) NOT NULL,
            customer_phone      VARCHAR(20)  NOT NULL,
            preferred_date      DATE         NOT NULL,
            message             TEXT,
            confirmed_date      DATE         DEFAULT NULL,
            confirmed_time      VARCHAR(10)  DEFAULT NULL,
            confirmed_location  VARCHAR(300) DEFAULT NULL,
            status              VARCHAR(20)  DEFAULT 'pending',
            created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ── Migrate dealership columns onto existing tables ───────────────────────
    await conn.query(`ALTER TABLE listings       ADD COLUMN IF NOT EXISTS dealership_id   VARCHAR(36)  DEFAULT NULL`);
    await conn.query(`ALTER TABLE listings       ADD COLUMN IF NOT EXISTS dealership_name VARCHAR(200) DEFAULT NULL`);
    await conn.query(`ALTER TABLE pending_listings ADD COLUMN IF NOT EXISTS dealership_id   VARCHAR(36)  DEFAULT NULL`);
    await conn.query(`ALTER TABLE pending_listings ADD COLUMN IF NOT EXISTS dealership_name VARCHAR(200) DEFAULT NULL`);

    // ── Migrate dealership type column ────────────────────────────────────────
    await conn.query(`ALTER TABLE dealerships ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'drive_prime'`);

    // ── Migrate expanded address fields ───────────────────────────────────────
    const newFields = [
        { name: 'district', type: 'VARCHAR(100)' },
        { name: 'taluk', type: 'VARCHAR(100)' },
        { name: 'town', type: 'VARCHAR(100)' },
        { name: 'pincode', type: 'VARCHAR(20)' },
        { name: 'address', type: 'VARCHAR(300)' },
    ];
    for (const table of ['listings', 'pending_listings', 'dealerships']) {
        for (const field of newFields) {
            if (table === 'dealerships' && field.name === 'address') continue;
            await conn.query(
                `ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${field.name} ${field.type} DEFAULT NULL`
            );
        }
    }

    // ── dealership_messages table ─────────────────────────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS dealership_messages (
            id                      VARCHAR(36)  PRIMARY KEY,
            from_dealership_id      VARCHAR(36)  DEFAULT NULL,
            from_dealership_name    VARCHAR(200) DEFAULT 'Platform',
            to_dealership_id        VARCHAR(36)  DEFAULT NULL,
            to_dealership_name      VARCHAR(200) DEFAULT 'All Dealerships',
            sender_id               VARCHAR(36)  NOT NULL,
            sender_name             VARCHAR(200) NOT NULL,
            subject                 VARCHAR(300) NOT NULL,
            body                    TEXT         NOT NULL,
            is_read                 BOOLEAN      DEFAULT FALSE,
            created_at              TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // ── Ensure images columns are TEXT (safe to run on existing tables) ───────
    try {
        await conn.query(`ALTER TABLE listings         ALTER COLUMN images TYPE TEXT`);
        await conn.query(`ALTER TABLE pending_listings ALTER COLUMN images TYPE TEXT`);
    } catch (_) {
        // Already TEXT — ignore
    }

    // ── carousel_items table (admin-selected vehicles for homepage carousel) ──
    await conn.query(`
        CREATE TABLE IF NOT EXISTS carousel_items (
            id              SERIAL       PRIMARY KEY,
            listing_id      VARCHAR(36)  NOT NULL UNIQUE,
            sort_order      INT          DEFAULT 0,
            custom_title    VARCHAR(200) DEFAULT NULL,
            custom_subtitle VARCHAR(400) DEFAULT NULL,
            bg_gradient     VARCHAR(300) DEFAULT NULL,
            created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Safely add new columns to existing carousel_items tables
    await conn.query(`ALTER TABLE carousel_items ADD COLUMN IF NOT EXISTS custom_title    VARCHAR(200) DEFAULT NULL`);
    await conn.query(`ALTER TABLE carousel_items ADD COLUMN IF NOT EXISTS custom_subtitle VARCHAR(400) DEFAULT NULL`);
    await conn.query(`ALTER TABLE carousel_items ADD COLUMN IF NOT EXISTS bg_gradient     VARCHAR(300) DEFAULT NULL`);

    // ── banners table (admin-managed hero carousel) ───────────────────────────
    await conn.query(`
        CREATE TABLE IF NOT EXISTS banners (
            id          SERIAL       PRIMARY KEY,
            title       VARCHAR(200) DEFAULT '',
            subtitle    VARCHAR(400) DEFAULT '',
            cta_label   VARCHAR(100) DEFAULT 'Browse Cars',
            cta_link    VARCHAR(300) DEFAULT '/search',
            image_url   TEXT         DEFAULT '',
            badge_text  VARCHAR(100) DEFAULT '',
            active      BOOLEAN      DEFAULT TRUE,
            sort_order  INT          DEFAULT 0,
            created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Seed 3 default banner slides if none exist
    const bannerCount = await conn.query('SELECT COUNT(*) AS cnt FROM banners');
    if (parseInt(bannerCount.rows[0].cnt) === 0) {
        const defaultBanners = [
            {
                title: 'Find Your Perfect Dream Car',
                subtitle: 'Choose from 10,000+ verified pre-owned cars across India. Transparent pricing, zero fraud.',
                cta_label: 'Browse Cars',
                cta_link: '/search',
                badge_text: 'Trusted Marketplace',
                sort_order: 1,
            },
            {
                title: 'Drive Home with Confidence',
                subtitle: '200-point inspected vehicles with 5-day money-back guarantee and full warranty support.',
                cta_label: 'View Inspected Cars',
                cta_link: '/search',
                badge_text: 'Fully Inspected',
                sort_order: 2,
            },
            {
                title: 'Best Prices. Fixed. Upfront.',
                subtitle: 'No haggling, no hidden charges. Get the best price guaranteed — doorstep delivery available.',
                cta_label: 'Explore Deals',
                cta_link: '/search',
                badge_text: 'Fixed Price Guarantee',
                sort_order: 3,
            },
        ];
        for (const b of defaultBanners) {
            await conn.query(
                `INSERT INTO banners (title, subtitle, cta_label, cta_link, image_url, badge_text, active, sort_order)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
                [b.title, b.subtitle, b.cta_label, b.cta_link, '', b.badge_text, true, b.sort_order]
            );
        }
        console.log('🎠  Default banner slides seeded.');
    }

    console.log(`✅  Database "${dbName}" and tables are ready.`);
    await conn.end();
}

module.exports = setup;
