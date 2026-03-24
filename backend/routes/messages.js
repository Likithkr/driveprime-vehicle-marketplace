const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { requireAdmin } = require('../middleware/auth');
const { broadcast } = require('../sse');

function rowToMessage(row) {
    return {
        id: row.id,
        fromDealershipId: row.from_dealership_id,
        fromDealershipName: row.from_dealership_name,
        toDealershipId: row.to_dealership_id,
        toDealershipName: row.to_dealership_name,
        senderId: row.sender_id,
        senderName: row.sender_name,
        subject: row.subject,
        body: row.body,
        isRead: Boolean(row.is_read),
        createdAt: row.created_at,
    };
}

// GET /api/messages — admin only, fetch all messages newest first
// Optional filter: ?dealershipId=xxx (messages to or from that dealership)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const { dealershipId } = req.query;
        let sql = 'SELECT * FROM dealership_messages';
        const params = [];
        if (dealershipId) {
            sql += ' WHERE from_dealership_id = $1 OR to_dealership_id = $2 OR to_dealership_id IS NULL';
            params.push(dealershipId, dealershipId);
        }
        sql += ' ORDER BY created_at DESC';
        const [rows] = await db.query(sql, params);
        res.json(rows.map(rowToMessage));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/messages/unread-count — admin only, returns count of unread messages
router.get('/unread-count', requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT COUNT(*) AS cnt FROM dealership_messages WHERE is_read = false');
        res.json({ count: Number(rows[0].cnt) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/messages — admin: compose message
router.post('/', requireAdmin, async (req, res) => {
    try {
        const {
            fromDealershipId = null,
            fromDealershipName = 'Platform',
            toDealershipId = null,
            toDealershipName = 'All Dealerships',
            subject,
            body,
        } = req.body;
        if (!subject || !body) return res.status(400).json({ error: 'Subject and body are required' });
        const id = uuidv4();
        await db.query(
            `INSERT INTO dealership_messages
             (id, from_dealership_id, from_dealership_name, to_dealership_id, to_dealership_name,
              sender_id, sender_name, subject, body)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [
                id,
                fromDealershipId, fromDealershipName,
                toDealershipId, toDealershipName,
                req.user.id, req.user.name,
                subject, body,
            ]
        );
        const [rows] = await db.query('SELECT * FROM dealership_messages WHERE id = $1', [id]);
        broadcast('messages:changed');
        res.status(201).json(rowToMessage(rows[0]));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/messages/:id/read — mark as read
router.patch('/:id/read', requireAdmin, async (req, res) => {
    try {
        await db.query('UPDATE dealership_messages SET is_read = true WHERE id = $1', [req.params.id]);
        broadcast('messages:changed');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/messages/read-all — mark all as read
router.patch('/read-all', requireAdmin, async (req, res) => {
    try {
        await db.query('UPDATE dealership_messages SET is_read = true WHERE is_read = false');
        broadcast('messages:changed');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/messages/:id — delete a message
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM dealership_messages WHERE id = $1', [req.params.id]);
        broadcast('messages:changed');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
