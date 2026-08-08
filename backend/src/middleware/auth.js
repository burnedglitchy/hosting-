const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { safeUser } = require('../utils/sanitize');
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ message: 'Authentication required' });
    req.user = user; req.safeUser = safeUser(user); next();
  } catch { return res.status(401).json({ message: 'Authentication required' }); }
}
function requireAdmin(req, res, next) { if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' }); next(); }
module.exports = { requireAuth, requireAdmin };
