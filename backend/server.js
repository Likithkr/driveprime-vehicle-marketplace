require('dotenv').config();
const express = require('express');
const cors = require('cors');
const setup = require('./setup');
const { addClient } = require('./sse');

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
app.use('/api/settings', require('./routes/settings'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/dealerships', require('./routes/dealerships'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/carousel', require('./routes/carousel'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// ── SSE — live data push to all connected browser tabs ───────────────────────
app.get('/api/events', (req, res) => addClient(req, res));

// ── Start ────────────────────────────────────────────────────────────────────
async function start() {
    try {
        await setup();           // auto-create DB + tables on first run
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Drive Prime API running`);
        });
    } catch (err) {
        console.error('❌ Failed to start server', err.message);
        process.exit(1);
    }
}

start();
