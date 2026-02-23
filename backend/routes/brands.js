const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/brands — all brands
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM brands ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/brands — add a brand
router.post('/', async (req, res) => {
    const { name, type = 'both', logo_url = '' } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Brand name is required' });
    try {
        const [result] = await db.query(
            'INSERT INTO brands (name, type, logo_url) VALUES (?, ?, ?)',
            [name.trim(), type, logo_url]
        );
        const [rows] = await db.query('SELECT * FROM brands WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Brand already exists' });
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/brands/:id — update a brand
router.put('/:id', async (req, res) => {
    const { name, type, logo_url } = req.body;
    try {
        await db.query(
            'UPDATE brands SET name = ?, type = ?, logo_url = ? WHERE id = ?',
            [name, type, logo_url || '', req.params.id]
        );
        const [rows] = await db.query('SELECT * FROM brands WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/brands/:id — delete a brand
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM brands WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
