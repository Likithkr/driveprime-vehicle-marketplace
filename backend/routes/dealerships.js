const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { requireAdmin } = require('../middleware/auth');
const { broadcast } = require('../sse');

function rowToDealership(row) {
    return {
        id: row.id,
        name: row.name,
        type: row.type || 'drive_prime',
        address: row.address,
        town: row.town,
        city: row.city,
        taluk: row.taluk,
        district: row.district,
        state: row.state,
        pincode: row.pincode,
        phone: row.phone,
        email: row.email,
        createdAt: row.created_at,
    };
}

// GET /api/dealerships — public, for dropdowns
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM dealerships ORDER BY type ASC, name ASC');
        res.json(rows.map(rowToDealership));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/dealerships — admin-only, add dealership
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { name, type = 'drive_prime', address = '', town = '', city = '', taluk = '', district = '', state = '', pincode = '', phone = '', email = '' } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        const id = uuidv4();

        await db.query(
            'INSERT INTO dealerships (id, name, type, address, town, city, taluk, district, state, pincode, phone, email) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
            [id, name, type, address, town, city, taluk, district, state, pincode, phone, email]
        );

        // Auto-create dealer account
        const crypto = require('crypto');
        const bcrypt = require('bcryptjs');
        const tempPassword = crypto.randomBytes(4).toString('hex');
        const hash = await bcrypt.hash(tempPassword, 10);
        const userId = uuidv4();
        const userEmail = email || `dealer_${id.substring(0, 8)}@driveprime.in`;

        try {
            await db.query(
                'INSERT INTO users (id, name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, name, userEmail, hash, 'dealer', phone || '']
            );
        } catch (userErr) {
            console.error('Failed to create user account for dealership:', userErr);
        }

        const [rows] = await db.query('SELECT * FROM dealerships WHERE id = ?', [id]);
        broadcast('dealerships:changed');

        const responseData = rowToDealership(rows[0]);
        responseData.tempPassword = tempPassword;
        responseData.accountEmail = userEmail;

        res.status(201).json(responseData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/dealerships/:id — admin-only, update dealership
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { name, type = 'drive_prime', address = '', town = '', city = '', taluk = '', district = '', state = '', pincode = '', phone = '', email = '' } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        await db.query(
            'UPDATE dealerships SET name=?, type=?, address=?, town=?, city=?, taluk=?, district=?, state=?, pincode=?, phone=?, email=? WHERE id=?',
            [name, type, address, town, city, taluk, district, state, pincode, phone, email, req.params.id]
        );
        const [rows] = await db.query('SELECT * FROM dealerships WHERE id = ?', [req.params.id]);
        broadcast('dealerships:changed');
        res.json(rowToDealership(rows[0]));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/dealerships/:id — admin-only, delete dealership
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM dealerships WHERE id = ?', [req.params.id]);
        broadcast('dealerships:changed');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
