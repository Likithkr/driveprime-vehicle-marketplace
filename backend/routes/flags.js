const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireDeveloper } = require('../middleware/auth');

// GET /api/flags — public (frontend reads on startup)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM feature_flags ORDER BY `key` ASC');
        // Return as { key: { value, description } }
        const flags = {};
        for (const row of rows) {
            flags[row.key] = { value: Boolean(row.value), description: row.description, updatedAt: row.updated_at };
        }
        res.json(flags);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/flags/:key — developer only
router.put('/:key', requireDeveloper, async (req, res) => {
    const { value } = req.body;
    try {
        await db.query(
            'UPDATE feature_flags SET value = ?, updated_by = ?, updated_at = NOW() WHERE `key` = ?',
            [value ? 1 : 0, req.user.email, req.params.key]
        );
        const [rows] = await db.query('SELECT * FROM feature_flags WHERE `key` = ?', [req.params.key]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
