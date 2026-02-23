require('dotenv').config();
const express = require('express');
const cors = require('cors');
const setup = require('./setup');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
    origin: (origin, callback) => {
        // Allow no-origin requests (curl, mobile apps, etc.)
        if (!origin) return callback(null, true);
        // Allow any host on Vite dev ports — covers localhost, LAN, and WAN public IP
        const allowed = /^http:\/\/.+:(5173|5174)$/.test(origin);
        callback(allowed ? null : new Error('CORS: origin not allowed'), allowed);
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // images are base64-encoded strings

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/listings', require('./routes/listings'));
app.use('/api/pending', require('./routes/pending'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/flags', require('./routes/flags'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// ── Start ────────────────────────────────────────────────────────────────────
async function start() {
    try {
        await setup();           // auto-create DB + tables on first run
        app.listen(PORT, () => {
            console.log(`🚀  Drive Prime API running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌  Failed to start server:', err.message);
        console.error('    Make sure MySQL is running (XAMPP → Start MySQL)');
        process.exit(1);
    }
}

start();
