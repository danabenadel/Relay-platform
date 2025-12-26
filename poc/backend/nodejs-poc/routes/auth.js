// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({ 
        error: 'Email, password and username are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmailOrUsername(email, username);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Créer nouvel utilisateur
    const user = await User.create({ email, username, password });

    // Générer token JWT
    const token = jwt.sign(
      { userId: user.id }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Trouver l'utilisateur
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Générer token JWT
    const token = jwt.sign(
      { userId: user.id }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Renvoyer sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile (route protégée)
router.get('/profile', authenticateToken, async (req, res) => {
  res.json({
    message: 'Profile access successful',
    user: req.user
  });
});

// Liste des utilisateurs (debug)
router.get('/users', async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const users = await User.findAll(parseInt(limit), parseInt(offset));
    const total = await User.count();
    
    res.json({
      users,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
