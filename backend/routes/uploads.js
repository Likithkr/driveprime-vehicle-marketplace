const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// ── Ensure uploads directory exists ──────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '../uploads/docs');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Multer storage ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || '.bin';
        cb(null, `${uuidv4()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        cb(null, allowed.includes(file.mimetype));
    },
});

// ── POST /api/uploads/doc — admin uploads a document scan for a pending listing ──
// Fields: pendingId, docKey (e.g. "rc"), file: the binary
router.post('/doc', requireAdmin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded or unsupported type' });
        const { pendingId, docKey } = req.body;
        if (!pendingId || !docKey) return res.status(400).json({ error: 'pendingId and docKey are required' });

        const id = uuidv4();
        const fileUrl = `/uploads/docs/${req.file.filename}`;

        // If a record already exists for this listing+docKey, replace it
        await db.query('DELETE FROM doc_uploads WHERE pending_id = ? AND doc_key = ?', [pendingId, docKey]);
        await db.query(
            'INSERT INTO doc_uploads (id, pending_id, doc_key, original_name, file_url, mime_type, file_size) VALUES (?,?,?,?,?,?,?)',
            [id, pendingId, docKey, req.file.originalname, fileUrl, req.file.mimetype, req.file.size]
        );

        res.status(201).json({ id, pendingId, docKey, fileUrl, originalName: req.file.originalname });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /api/uploads/doc/:pendingId — fetch all uploaded docs for a listing ──
router.get('/doc/:pendingId', requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM doc_uploads WHERE pending_id = ? ORDER BY doc_key ASC',
            [req.params.pendingId]
        );
        res.json(rows.map(r => ({
            id: r.id,
            pendingId: r.pending_id,
            docKey: r.doc_key,
            fileUrl: r.file_url,
            originalName: r.original_name,
            mimeType: r.mime_type,
            fileSize: r.file_size,
            uploadedAt: r.uploaded_at,
        })));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── DELETE /api/uploads/doc/:id — remove a specific upload ──
router.delete('/doc/:id', requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM doc_uploads WHERE id = ?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });

        // Delete the physical file
        const filePath = path.join(__dirname, '../uploads/docs', path.basename(rows[0].file_url));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await db.query('DELETE FROM doc_uploads WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
