const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { broadcast } = require('../sse');

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
        district: row.district,
        taluk: row.taluk,
        town: row.town,
        city: row.city,
        pincode: row.pincode,
        address: row.address,
        location: row.location,
        about: row.about,
        price: row.price,
        images: typeof row.images === 'string' ? JSON.parse(row.images) : (row.images || []),
        dealerName: row.dealer_name,
        dealerPhone: row.dealer_phone,
        dealerEmail: row.dealer_email,
        dealerWhatsApp: row.dealer_whatsapp,
        dealershipId: row.dealership_id || null,
        dealershipName: row.dealership_name || null,
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
              ownership, insurance, color, state, district, taluk, town, city, pincode, address, location, about, price,
              images, dealer_name, dealer_phone, dealer_email, dealer_whatsapp,
              status, featured, dealership_id, dealership_name)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                id, l.brand, l.model, l.variant, l.type || 'Car',
                l.year, l.km, l.fuel, l.transmission, l.ownership,
                l.insurance, l.color, l.state, l.district, l.taluk, l.town, l.city, l.pincode, l.address,
                l.location || `${l.town || l.city}, ${l.district || l.state}`,
                l.about, l.price,
                JSON.stringify(l.images || []),
                l.dealerName, l.dealerPhone, l.dealerEmail, l.dealerWhatsApp,
                l.status || 'live', l.featured ? 1 : 0,
                l.dealershipId || null, l.dealershipName || null,
            ]
        );
        const [rows] = await db.query('SELECT * FROM listings WHERE id = ?', [id]);
        const listing = rowToListing(rows[0]);
        broadcast('listings:changed');
        res.status(201).json(listing);
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
              transmission=?, ownership=?, insurance=?, color=?, state=?, district=?, taluk=?, town=?, city=?, pincode=?, address=?,
              location=?, about=?, price=?, images=?, dealer_name=?, dealer_phone=?,
              dealer_email=?, dealer_whatsapp=?, status=?, featured=?,
              dealership_id=?, dealership_name=?
             WHERE id=?`,
            [
                l.brand, l.model, l.variant, l.type || 'Car',
                l.year, l.km, l.fuel, l.transmission, l.ownership,
                l.insurance, l.color, l.state, l.district, l.taluk, l.town, l.city, l.pincode, l.address,
                l.location || `${l.town || l.city}, ${l.district || l.state}`,
                l.about, l.price,
                JSON.stringify(l.images || []),
                l.dealerName, l.dealerPhone, l.dealerEmail, l.dealerWhatsApp,
                l.status || 'live', l.featured ? 1 : 0,
                l.dealershipId || null, l.dealershipName || null,
                req.params.id,
            ]
        );
        const [rows] = await db.query('SELECT * FROM listings WHERE id = ?', [req.params.id]);
        const listing = rowToListing(rows[0]);
        broadcast('listings:changed');
        res.json(listing);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/listings/:id — delete a listing
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM listings WHERE id = ?', [req.params.id]);
        broadcast('listings:changed');
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
        const listing = rowToListing(rows[0]);
        broadcast('listings:changed');
        res.json(listing);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
