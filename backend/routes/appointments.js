const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { broadcast } = require('../sse');

// ── Nodemailer transport (reuses same SMTP as auth.js) ───────────────────────
const mailer = process.env.SMTP_HOST ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
}) : null;

// ── Twilio WhatsApp (optional) ───────────────────────────────────────────────
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
        const twilio = require('twilio');
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    } catch {
        console.warn('[appointments] twilio package not installed — WhatsApp via Twilio disabled.');
    }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d) {
    if (!d) return 'TBD';
    return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

async function sendConfirmationEmail(appt) {
    if (!mailer) return;
    const waLink = `https://wa.me/${(appt.customer_phone || '').replace(/\D/g, '')}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 1.6rem;">📅 Appointment Confirmed!</h1>
        </div>
        <div style="background: #fff; border: 1px solid #e2e8f0; border-top: none; padding: 28px; border-radius: 0 0 16px 16px;">
            <p style="font-size: 1rem; margin-bottom: 20px;">Hi <strong>${appt.customer_name}</strong>, your in-person viewing appointment has been confirmed by Drive Prime. Here are your details:</p>

            <table style="width:100%; border-collapse:collapse; margin-bottom: 24px;">
                <tr style="background:#f8fafc;">
                    <td style="padding:12px; font-weight:700; border-bottom:1px solid #e2e8f0; width:40%;">🚗 Vehicle</td>
                    <td style="padding:12px; border-bottom:1px solid #e2e8f0;">${appt.car_name}</td>
                </tr>
                <tr>
                    <td style="padding:12px; font-weight:700; border-bottom:1px solid #e2e8f0;">📅 Date</td>
                    <td style="padding:12px; border-bottom:1px solid #e2e8f0;">${fmtDate(appt.confirmed_date)}</td>
                </tr>
                <tr style="background:#f8fafc;">
                    <td style="padding:12px; font-weight:700; border-bottom:1px solid #e2e8f0;">🕐 Time</td>
                    <td style="padding:12px; border-bottom:1px solid #e2e8f0;">${appt.confirmed_time || 'TBD'}</td>
                </tr>
                <tr>
                    <td style="padding:12px; font-weight:700;">📍 Location</td>
                    <td style="padding:12px;">${appt.confirmed_location || 'TBD'}</td>
                </tr>
            </table>

            <p style="color:#64748b; font-size:0.9rem;">If you have any questions, feel free to reach out to us via WhatsApp or phone.</p>
            <a href="${waLink}" style="display:inline-block; background:#25D366; color:#fff; padding:12px 28px; border-radius:99px; text-decoration:none; font-weight:700; margin-top:8px;">
                💬 Open WhatsApp Chat
            </a>
            <hr style="margin:24px 0; border:none; border-top:1px solid #e2e8f0;" />
            <p style="font-size:0.8rem; color:#94a3b8; text-align:center;">Drive Prime · Auto Marketplace</p>
        </div>
    </div>`;

    await mailer.sendMail({
        from: process.env.SMTP_FROM || '"Drive Prime" <noreply@driveprime.in>',
        to: appt.customer_email,
        subject: `✅ Appointment Confirmed — ${appt.car_name}`,
        html,
    });
}

async function sendCancellationEmail(appt) {
    if (!mailer) return;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
        <div style="background: #ef4444; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 1.6rem;">Appointment Cancelled</h1>
        </div>
        <div style="background: #fff; border: 1px solid #e2e8f0; border-top: none; padding: 28px; border-radius: 0 0 16px 16px;">
            <p>Hi <strong>${appt.customer_name}</strong>,</p>
            <p>Unfortunately, your viewing appointment for <strong>${appt.car_name}</strong> has been cancelled.</p>
            <p style="color:#64748b;">Please contact Drive Prime to reschedule or explore other available vehicles.</p>
            <hr style="margin:24px 0; border:none; border-top:1px solid #e2e8f0;" />
            <p style="font-size:0.8rem; color:#94a3b8; text-align:center;">Drive Prime · Auto Marketplace</p>
        </div>
    </div>`;

    await mailer.sendMail({
        from: process.env.SMTP_FROM || '"Drive Prime" <noreply@driveprime.in>',
        to: appt.customer_email,
        subject: `Appointment Cancelled — ${appt.car_name}`,
        html,
    });
}

async function sendWhatsApp(phone, message) {
    if (!twilioClient) return;
    const to = `whatsapp:+${phone.replace(/\D/g, '')}`;
    const from = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
    try {
        await twilioClient.messages.create({ body: message, from, to });
    } catch (err) {
        console.warn('[appointments] WhatsApp send failed:', err.message);
    }
}

// ── POST /api/appointments — customer submits (must be signed in) ─────────────
router.post('/', requireAuth, async (req, res) => {
    const { listing_id, car_name, preferred_date, message = '' } = req.body;
    if (!listing_id || !preferred_date) {
        return res.status(400).json({ error: 'listing_id and preferred_date are required' });
    }

    // Pull customer details from the JWT user (no manual input needed)
    const { id: user_id, name: customer_name, email: customer_email, phone: customer_phone } = req.user;
    if (!customer_email) return res.status(400).json({ error: 'Your account email is missing. Please update your profile.' });

    const id = crypto.randomUUID();
    await db.query(
        `INSERT INTO appointments (id, listing_id, car_name, user_id, customer_name, customer_email, customer_phone, preferred_date, message)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [id, listing_id, car_name || '', user_id, customer_name, customer_email, customer_phone || '', preferred_date, message]
    );

    const [rows] = await db.query('SELECT * FROM appointments WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
});

// ── GET /api/appointments — admin: all appointments ───────────────────────────
router.get('/', requireAdmin, async (req, res) => {
    const [rows] = await db.query('SELECT * FROM appointments ORDER BY created_at DESC');
    res.json(rows);
});

// ── GET /api/appointments/mine — customer: own appointments ───────────────────
router.get('/mine', requireAuth, async (req, res) => {
    const [rows] = await db.query(
        'SELECT * FROM appointments WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id]
    );
    res.json(rows);
});

// ── PATCH /api/appointments/:id/confirm — admin confirms with details ─────────
router.patch('/:id/confirm', requireAdmin, async (req, res) => {
    const { confirmed_date, confirmed_time, confirmed_location } = req.body;
    if (!confirmed_date || !confirmed_time || !confirmed_location) {
        return res.status(400).json({ error: 'confirmed_date, confirmed_time, and confirmed_location are required' });
    }

    await db.query(
        `UPDATE appointments SET status='confirmed', confirmed_date=?, confirmed_time=?, confirmed_location=? WHERE id=?`,
        [confirmed_date, confirmed_time, confirmed_location, req.params.id]
    );

    const [rows] = await db.query('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });
    const appt = rows[0];

    // Send email + WhatsApp notifications (non-blocking)
    Promise.allSettled([
        sendConfirmationEmail(appt),
        sendWhatsApp(
            appt.customer_phone,
            `Hi ${appt.customer_name}! Your Drive Prime appointment for *${appt.car_name}* is confirmed.\n\n` +
            `📅 Date: ${fmtDate(appt.confirmed_date)}\n` +
            `🕐 Time: ${appt.confirmed_time}\n` +
            `📍 Location: ${appt.confirmed_location}\n\n` +
            `We look forward to seeing you!`
        ),
    ]).then(results => {
        results.forEach((r, i) => {
            if (r.status === 'rejected') console.warn(`[appointments] notification ${i} failed:`, r.reason?.message);
        });
    });

    broadcast('appointments:changed');
    res.json(appt);
});

// ── PATCH /api/appointments/:id/cancel — admin cancels ───────────────────────
router.patch('/:id/cancel', requireAdmin, async (req, res) => {
    await db.query(`UPDATE appointments SET status='cancelled' WHERE id=?`, [req.params.id]);

    const [rows] = await db.query('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Appointment not found' });
    const appt = rows[0];

    // Send cancellation email (non-blocking)
    sendCancellationEmail(appt).catch(err =>
        console.warn('[appointments] cancellation email failed:', err.message)
    );

    broadcast('appointments:changed');
    res.json(appt);
});

// ── DELETE /api/appointments/:id — admin hard-deletes ────────────────────────
router.delete('/:id', requireAdmin, async (req, res) => {
    const [result] = await db.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Appointment not found' });
    broadcast('appointments:changed');
    res.json({ success: true });
});

module.exports = router;
