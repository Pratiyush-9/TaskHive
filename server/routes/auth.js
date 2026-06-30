const express = require('express');
const router = express.Router();
const { register, login, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

// Find user by email (for adding members)
router.get('/find', protect, async (req, res) => {
  try {
    const user = await User.findOne({ 
      email: req.query.email 
    }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;