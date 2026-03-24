const express = require('express');
const router = express.Router();
const db = require('../db');

// ── GET /api/banners — public, returns active banners ordered by sort_order ──
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM banners WHERE active = TRUE ORDER BY sort_order ASC, created_at ASC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /api/banners/all — admin: all banners (including inactive) ────────────
router.get('/all', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM banners ORDER BY sort_order ASC, created_at ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /api/banners — admin: create a new banner ────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { title, subtitle, cta_label, cta_link, image_url, badge_text, active, sort_order } = req.body;
        const [rows] = await db.query(
            `INSERT INTO banners
               (title, subtitle, cta_label, cta_link, image_url, badge_text, active, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                title || '',
                subtitle || '',
                cta_label || 'Browse Cars',
                cta_link || '/search',
                image_url || '',
                badge_text || '',
                active !== false,
                sort_order || 0,
            ]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PUT /api/banners/:id — admin: update a banner ─────────────────────────────
router.put('/:id', async (req, res) => {
    try {
        const { title, subtitle, cta_label, cta_link, image_url, badge_text, active, sort_order } = req.body;
        const [rows] = await db.query(
            `UPDATE banners SET
               title=$1, subtitle=$2, cta_label=$3, cta_link=$4,
               image_url=$5, badge_text=$6, active=$7, sort_order=$8,
               updated_at=NOW()
             WHERE id=$9
             RETURNING *`,
            [title, subtitle, cta_label, cta_link, image_url, badge_text, active, sort_order, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Banner not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /api/banners/:id — admin: delete a banner ─────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM banners WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
