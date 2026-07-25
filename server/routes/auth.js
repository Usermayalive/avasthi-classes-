const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Helper to generate unique IDs
const generateId = () => 'u-' + Math.random().toString(36).substr(2, 9);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    // Check if email already registered
    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      id: generateId(),
      name,
      email,
      phone,
      passwordHash,
      role: 'subscriber', // default role (Free user)
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);

    // Generate JWT Token
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { name, phone, password } = req.body;
  const userId = req.user.id;

  try {
    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (phone) updatedFields.phone = phone;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedFields.passwordHash = await bcrypt.hash(password, salt);
    }

    const updatedUser = db.updateUser(userId, updatedFields);

    res.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update.' });
  }
});

module.exports = router;
