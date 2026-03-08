const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireDeveloper } = require('../middleware/auth');
const { broadcast } = require('../sse');

// GET /api/settings — public (frontend reads on startup)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM settings ORDER BY `key` ASC');
        // Return as { key: value }
        const settings = {};
        for (const row of rows) {
            settings[row.key] = row.value;
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/settings/all — developers only (returns full rows including metadata)
router.get('/all', requireDeveloper, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM settings ORDER BY `key` ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/settings/:key — developer only
router.put('/:key', requireDeveloper, async (req, res) => {
    const { value } = req.body;
    try {
        await db.query(
            'UPDATE settings SET value = ?, updated_by = ?, updated_at = NOW() WHERE `key` = ?',
            [String(value), req.user.email, req.params.key]
        );
        const [rows] = await db.query('SELECT * FROM settings WHERE `key` = ?', [req.params.key]);
        broadcast('settings:changed');
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
