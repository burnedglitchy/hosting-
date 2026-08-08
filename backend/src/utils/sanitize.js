function safeUser(user) { if (!user) return null; const { passwordHash, googleId, ...safe } = user; return safe; }
module.exports = { safeUser };
