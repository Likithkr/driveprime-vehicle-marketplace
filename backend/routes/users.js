const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/users — list all users (admin+)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/users — admin creates user
router.post('/', requireAdmin, async (req, res) => {
    const { name, email, password, role = 'customer', phone = '' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });

    if (role === 'developer' && req.user.role !== 'developer') {
        return res.status(403).json({ error: 'Only a developer can create developer accounts' });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        const id = require('crypto').randomUUID();
        await db.query(
            'INSERT INTO users (id, name, email, password_hash, role, phone) VALUES ($1,$2,$3,$4,$5,$6)',
            [id, name.trim(), email.toLowerCase().trim(), hash, role, phone]
        );
        const [rows] = await db.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1', [id]);
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/users/:id — update name / role / phone
router.put('/:id', requireAdmin, async (req, res) => {
    const { name, role, phone } = req.body;

    if (role === 'developer' && req.user.role !== 'developer') {
        return res.status(403).json({ error: 'Only a developer can grant developer role' });
    }

    try {
        await db.query(
            'UPDATE users SET name = $1, role = $2, phone = $3 WHERE id = $4',
            [name, role, phone || '', req.params.id]
        );
        const [rows] = await db.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/users/:id
router.delete('/:id', requireAdmin, async (req, res) => {
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' });
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
