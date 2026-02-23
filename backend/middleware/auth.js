const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'driveprime_secret_key_change_in_prod';

/**
 * Verify JWT from Authorization: Bearer <token>
 * Attaches req.user = { id, name, email, role }
 */
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
    try {
        req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/** Must be admin or developer */
function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (!['admin', 'developer'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    });
}

/** Must be developer */
function requireDeveloper(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user.role !== 'developer') {
            return res.status(403).json({ error: 'Developer access required' });
        }
        next();
    });
}

module.exports = { requireAuth, requireAdmin, requireDeveloper, JWT_SECRET };
