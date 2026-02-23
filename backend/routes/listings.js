const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Helper: convert DB row → JS object (snake_case → camelCase, parse JSON images)
function rowToListing(row) {
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
        status: row.status,
        featured: Boolean(row.featured),
        createdAt: row.created_at,
    };
}

// GET /api/listings — fetch all listings
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM listings ORDER BY created_at DESC');
        res.json(rows.map(rowToListing));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/listings — add a new listing
router.post('/', async (req, res) => {
    try {
        const l = req.body;
        const id = l.id || uuidv4();
        await db.query(
            `INSERT INTO listings
             (id, brand, model, variant, type, year, km, fuel, transmission,
              ownership, insurance, color, state, city, location, about, price,
              images, dealer_name, dealer_phone, dealer_email, dealer_whatsapp,
              status, featured)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                id, l.brand, l.model, l.variant, l.type || 'Car',
                l.year, l.km, l.fuel, l.transmission, l.ownership,
                l.insurance, l.color, l.state, l.city,
                l.location || `${l.city}, ${l.state}`,
                l.about, l.price,
                JSON.stringify(l.images || []),
                l.dealerName, l.dealerPhone, l.dealerEmail, l.dealerWhatsApp,
                l.status || 'live', l.featured ? 1 : 0,
            ]
        );
        const [rows] = await db.query('SELECT * FROM listings WHERE id = ?', [id]);
        res.status(201).json(rowToListing(rows[0]));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/listings/:id — update a listing
router.put('/:id', async (req, res) => {
    try {
        const l = req.body;
        await db.query(
            `UPDATE listings SET
              brand=?, model=?, variant=?, type=?, year=?, km=?, fuel=?,
              transmission=?, ownership=?, insurance=?, color=?, state=?, city=?,
              location=?, about=?, price=?, images=?, dealer_name=?, dealer_phone=?,
              dealer_email=?, dealer_whatsapp=?, status=?, featured=?
             WHERE id=?`,
            [
                l.brand, l.model, l.variant, l.type || 'Car',
                l.year, l.km, l.fuel, l.transmission, l.ownership,
                l.insurance, l.color, l.state, l.city,
                l.location || `${l.city}, ${l.state}`,
                l.about, l.price,
                JSON.stringify(l.images || []),
                l.dealerName, l.dealerPhone, l.dealerEmail, l.dealerWhatsApp,
                l.status || 'live', l.featured ? 1 : 0,
                req.params.id,
            ]
        );
        const [rows] = await db.query('SELECT * FROM listings WHERE id = ?', [req.params.id]);
        res.json(rowToListing(rows[0]));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/listings/:id — delete a listing
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM listings WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/listings/:id/toggle-sold — toggle live ↔ sold
router.patch('/:id/toggle-sold', async (req, res) => {
    try {
        await db.query(
            `UPDATE listings SET status = IF(status='sold','live','sold') WHERE id = ?`,
            [req.params.id]
        );
        const [rows] = await db.query('SELECT * FROM listings WHERE id = ?', [req.params.id]);
        res.json(rowToListing(rows[0]));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
