/**
 * sse.js — Server-Sent Events broadcast registry
 *
 * Usage in any route:
 *   const { broadcast } = require('../sse');
 *   broadcast('listings:changed');
 */

const clients = new Set();

/**
 * Register a new SSE client (call this in your GET /api/events handler).
 * Sets the correct headers and cleans up when the connection closes.
 */
function addClient(req, res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // disable Nginx buffering if behind proxy
    res.flushHeaders();

    // Send a heartbeat every 25s to keep the connection alive through idle timeouts
    const heartbeat = setInterval(() => {
        try { res.write(': heartbeat\n\n'); } catch { /* ignore */ }
    }, 25000);

    clients.add(res);
    console.log(`[SSE] client connected  (total: ${clients.size})`);

    req.on('close', () => {
        clearInterval(heartbeat);
        clients.delete(res);
        console.log(`[SSE] client disconnected (total: ${clients.size})`);
    });
}

/**
 * Push a named event to every connected browser tab.
 * @param {string} event  e.g. 'listings:changed'
 * @param {object} [data] optional JSON payload
 */
function broadcast(event, data = {}) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of clients) {
        try { res.write(payload); } catch { clients.delete(res); }
    }
    if (clients.size > 0) {
        console.log(`[SSE] broadcast → ${event} (${clients.size} client${clients.size > 1 ? 's' : ''})`);
    }
}

module.exports = { addClient, broadcast };
