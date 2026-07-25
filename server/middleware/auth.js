const jwt = require('jsonwebtoken');
const db = require('../db/db');

const JWT_SECRET = 'avasthi_secret_key_12345'; // Hardcoded for simple demo setup

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    
    const user = db.getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User no longer exists.' });
    }
    
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required.' });
  }
}

module.exports = {
  authenticateToken,
  requireAdmin,
  JWT_SECRET
};
