const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

function rowToPending(row) {
    return {
        id: row.id,
        brand: row.brand,
        model: row.model,
        variant: row.variant,
        type: row.type,
        year: row.year,
        km: row.km,
        fuel: row.fuel,
        transmission: row.transmission,
        ownership: row.ownership,
        insurance: row.insurance,
        color: row.color,
        state: row.state,
        city: row.city,
        location: row.location,
        about: row.about,
        price: row.price,
        images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
        dealerName: row.dealer_name,
        dealerPhone: row.dealer_phone,
        dealerEmail: row.dealer_email,
        dealerWhatsApp: row.dealer_whatsapp,
        submittedAt: row.submitted_at,
        createdAt: row.created_at,
    };
}

// GET /api/pending — all pending dealer submissions
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM pending_listings ORDER BY created_at DESC');
        res.json(rows.map(rowToPending));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/pending — dealer submits a listing
router.post('/', async (req, res) => {
    try {
        const l = req.body;
        const id = uuidv4();
        const submittedAt = new Date().toISOString().split('T')[0];
        await db.query(
            `INSERT INTO pending_listings
             (id, brand, model, variant, type, year, km, fuel, transmission,
              ownership, insurance, color, state, city, location, about, price,
              images, dealer_name, dealer_phone, dealer_email, dealer_whatsapp, submitted_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                id, l.brand, l.model, l.variant, l.type || 'Car',
                l.year, l.km, l.fuel, l.transmission, l.ownership,
                l.insurance, l.color, l.state, l.city,
                l.location || `${l.city}, ${l.state}`,
                l.about, l.price,
                JSON.stringify(l.images || []),
                l.dealerName, l.dealerPhone, l.dealerEmail, l.dealerWhatsApp,
                submittedAt,
            ]
        );
        const [rows] = await db.query('SELECT * FROM pending_listings WHERE id = ?', [id]);
        res.status(201).json(rowToPending(rows[0]));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/pending/:id/approve — approve: move to listings, remove from pending
router.post('/:id/approve', async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const [pending] = await conn.query('SELECT * FROM pending_listings WHERE id = ?', [req.params.id]);
        if (!pending.length) {
            await conn.rollback();
            return res.status(404).json({ error: 'Pending listing not found' });
        }
        const l = pending[0];
        const newId = uuidv4();
        await conn.query(
            `INSERT INTO listings
             (id, brand, model, variant, type, year, km, fuel, transmission,
              ownership, insurance, color, state, city, location, about, price,
              images, dealer_name, dealer_phone, dealer_email, dealer_whatsapp,
              status, featured)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                newId, l.brand, l.model, l.variant, l.type, l.year, l.km,
                l.fuel, l.transmission, l.ownership, l.insurance, l.color,
                l.state, l.city, l.location, l.about, l.price, l.images,
                l.dealer_name, l.dealer_phone, l.dealer_email, l.dealer_whatsapp,
                'live', 0,
            ]
        );
        await conn.query('DELETE FROM pending_listings WHERE id = ?', [req.params.id]);
        await conn.commit();

        const [rows] = await db.query('SELECT * FROM listings WHERE id = ?', [newId]);
        res.json({ approved: true, listing: rows[0] });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// DELETE /api/pending/:id — reject a submission
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM pending_listings WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
