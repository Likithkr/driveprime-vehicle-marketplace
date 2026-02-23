const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

function makeToken(user) {
    return jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// POST /api/auth/register — customer self-registration
router.post('/register', async (req, res) => {
    const { name, email, password, phone = '' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
    try {
        const hash = await bcrypt.hash(password, 10);
        const id = require('crypto').randomUUID();
        await db.query(
            'INSERT INTO users (id, name, email, password_hash, role, phone) VALUES (?,?,?,?,?,?)',
            [id, name.trim(), email.toLowerCase().trim(), hash, 'customer', phone]
        );
        const [rows] = await db.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [id]);
        res.status(201).json({ token: makeToken(rows[0]), user: rows[0] });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already registered' });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login — any role
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (!rows.length) return res.status(401).json({ error: 'Invalid email or password' });
        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
        const safe = { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone };
        res.json({ token: makeToken(safe), user: safe });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/me — returns own profile
router.get('/me', require('../middleware/auth').requireAuth, async (req, res) => {
    const [rows] = await db.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
});

module.exports = router;
