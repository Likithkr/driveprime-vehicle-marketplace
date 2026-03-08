const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

// Setup NodeMailer transport if SMTP details are in .env
const mailer = process.env.SMTP_HOST ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
}) : null;

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

// PUT /api/auth/profile — update own profile
router.put('/profile', require('../middleware/auth').requireAuth, async (req, res) => {
    const { name, phone } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });

    try {
        await db.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name.trim(), phone || '', req.user.id]);

        // Fetch updated user to return
        const [rows] = await db.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [req.user.id]);
        if (!rows.length) return res.status(404).json({ error: 'User not found' });

        res.json({ success: true, message: 'Profile updated successfully', user: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/auth/password — change own password
router.put('/password', require('../middleware/auth').requireAuth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'currentPassword and newPassword required' });
    try {
        const [rows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        if (!rows.length) return res.status(404).json({ error: 'User not found' });

        const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!valid) return res.status(401).json({ error: 'Incorrect current password' });

        const newHash = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/forgot-password — generate OTP and email it
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    try {
        const [rows] = await db.query('SELECT id, name, role FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (!rows.length) return res.status(404).json({ error: 'No account found with that email' });

        const user = rows[0];
        if (!['admin', 'developer', 'staff'].includes(user.role)) {
            return res.status(403).json({ error: 'Only admin or staff can reset passwords here.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
        const expiry = new Date(Date.now() + 10 * 60000); // 10 mins

        await db.query('UPDATE users SET reset_otp = ?, reset_otp_expiry = ? WHERE id = ?', [otp, expiry, user.id]);

        if (mailer) {
            await mailer.sendMail({
                from: process.env.SMTP_FROM || '"Drive Prime" <noreply@driveprime.in>',
                to: email,
                subject: 'Drive Prime Admin Password Reset OTP',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Hi ${user.name},</h2>
                        <p>You requested a password reset for your Drive Prime account.</p>
                        <p>Your 6-digit Verification Code is:</p>
                        <h1 style="background: #f4f4f5; padding: 12px; display: inline-block; letter-spacing: 4px; border-radius: 8px;">${otp}</h1>
                        <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                    </div>
                `
            });
            return res.json({ success: true, message: 'OTP sent to your email.' });
        } else {
            console.warn(`[dev] SMTP not configured. OTP for ${email} is: ${otp}`);
            return res.json({ success: true, message: 'OTP generated (Check server console).' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/reset-password-otp — verify OTP and reset
router.post('/reset-password-otp', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'email, otp, newPassword required' });
    try {
        const [rows] = await db.query('SELECT id, reset_otp, reset_otp_expiry FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (!rows.length) return res.status(404).json({ error: 'User not found' });

        const user = rows[0];
        if (!user.reset_otp || user.reset_otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });
        if (new Date() > new Date(user.reset_otp_expiry)) return res.status(401).json({ error: 'OTP has expired. Please request a new one.' });

        const newHash = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = ?, reset_otp = NULL, reset_otp_expiry = NULL WHERE id = ?', [newHash, user.id]);

        res.json({ success: true, message: 'Password has been successfully reset.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/customer-forgot-password — generate OTP and email it (for customers)
router.post('/customer-forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });
    try {
        const [rows] = await db.query('SELECT id, name FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (!rows.length) return res.status(404).json({ error: 'No account found with that email' });

        const user = rows[0];
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
        const expiry = new Date(Date.now() + 10 * 60000); // 10 mins

        await db.query('UPDATE users SET reset_otp = ?, reset_otp_expiry = ? WHERE id = ?', [otp, expiry, user.id]);

        if (mailer) {
            await mailer.sendMail({
                from: process.env.SMTP_FROM || '"Drive Prime" <noreply@driveprime.in>',
                to: email,
                subject: 'Drive Prime Password Reset OTP',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Hi ${user.name},</h2>
                        <p>You requested a password reset for your Drive Prime customer account.</p>
                        <p>Your 6-digit Verification Code is:</p>
                        <h1 style="background: #f4f4f5; padding: 12px; display: inline-block; letter-spacing: 4px; border-radius: 8px;">${otp}</h1>
                        <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                    </div>
                `
            });
            return res.json({ success: true, message: 'OTP sent to your email.' });
        } else {
            console.warn(`[dev] SMTP not configured. Customer OTP for ${email} is: ${otp}`);
            return res.json({ success: true, message: 'OTP generated (Check server console).' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/customer-reset-password-otp — verify OTP and reset (for customers)
router.post('/customer-reset-password-otp', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'email, otp, newPassword required' });
    try {
        const [rows] = await db.query('SELECT id, reset_otp, reset_otp_expiry FROM users WHERE email = ?', [email.toLowerCase().trim()]);
        if (!rows.length) return res.status(404).json({ error: 'User not found' });

        const user = rows[0];
        if (!user.reset_otp || user.reset_otp !== otp) return res.status(401).json({ error: 'Invalid OTP' });
        if (new Date() > new Date(user.reset_otp_expiry)) return res.status(401).json({ error: 'OTP has expired. Please request a new one.' });

        const newHash = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = ?, reset_otp = NULL, reset_otp_expiry = NULL WHERE id = ?', [newHash, user.id]);

        res.json({ success: true, message: 'Password has been successfully reset.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
