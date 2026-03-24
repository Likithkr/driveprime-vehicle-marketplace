const express = require('express');
const router = express.Router();
const db = require('../db');

// ── Helper: join carousel_items with listings ─────────────────────────────────
async function getCarouselWithListings() {
    const [rows] = await db.query(`
        SELECT
            ci.id            AS carousel_id,
            ci.sort_order,
            ci.custom_title,
            ci.custom_subtitle,
            ci.bg_gradient,
            ci.created_at    AS added_at,
            l.*
        FROM carousel_items ci
        JOIN listings l ON l.id = ci.listing_id
        WHERE l.status = 'live'
        ORDER BY ci.sort_order ASC, ci.created_at ASC
    `);
    return rows.map(row => ({
        carouselId:     row.carousel_id,
        sortOrder:      row.sort_order,
        customTitle:    row.custom_title   || null,
        customSubtitle: row.custom_subtitle || null,
        bgGradient:     row.bg_gradient    || null,
        addedAt:        row.added_at,
        id:             row.id,
        brand:          row.brand,
        model:          row.model,
        variant:        row.variant,
        type:           row.type,
        year:           row.year,
        km:             row.km,
        fuel:           row.fuel,
        transmission:   row.transmission,
        ownership:      row.ownership,
        price:          row.price,
        images:         typeof row.images === 'string' ? JSON.parse(row.images || '[]') : (row.images || []),
        city:           row.city,
        town:           row.town,
        district:       row.district,
        state:          row.state,
        status:         row.status,
        featured:       row.featured,
    }));
}

// GET /api/carousel — public (homepage)
router.get('/', async (req, res) => {
    try { res.json(await getCarouselWithListings()); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/carousel/items — admin view
router.get('/items', async (req, res) => {
    try { res.json(await getCarouselWithListings()); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/carousel — add listing
router.post('/', async (req, res) => {
    try {
        const { listing_id, sort_order } = req.body;
        if (!listing_id) return res.status(400).json({ error: 'listing_id is required' });

        const exists = await db.query('SELECT 1 FROM carousel_items WHERE listing_id = $1', [listing_id]);
        if (exists[0].length > 0) return res.status(409).json({ error: 'Already in carousel' });

        const [last] = await db.query('SELECT MAX(sort_order) AS max FROM carousel_items');
        const nextOrder = sort_order ?? ((last[0]?.max || 0) + 1);

        const [rows] = await db.query(
            'INSERT INTO carousel_items (listing_id, sort_order) VALUES ($1, $2) RETURNING *',
            [listing_id, nextOrder]
        );
        res.status(201).json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/carousel/:listing_id — update slide customisation + order
router.put('/:listing_id', async (req, res) => {
    try {
        const { sort_order, custom_title, custom_subtitle, bg_gradient } = req.body;
        await db.query(
            `UPDATE carousel_items
             SET sort_order=$1, custom_title=$2, custom_subtitle=$3, bg_gradient=$4
             WHERE listing_id=$5`,
            [sort_order || 0, custom_title || null, custom_subtitle || null, bg_gradient || null, req.params.listing_id]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/carousel/:listing_id — remove slide
router.delete('/:listing_id', async (req, res) => {
    try {
        await db.query('DELETE FROM carousel_items WHERE listing_id = $1', [req.params.listing_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Legacy order endpoint (kept for compat)
router.put('/:listing_id/order', async (req, res) => {
    try {
        const { sort_order } = req.body;
        await db.query('UPDATE carousel_items SET sort_order=$1 WHERE listing_id=$2', [sort_order, req.params.listing_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
