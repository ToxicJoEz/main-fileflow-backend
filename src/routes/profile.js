const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User');

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Use the userId from the token (attached by your middleware)
    const user = await User.findById(req.user.userId).select('-password'); // Exclude the password field
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({
      message: 'Profile information',
      user: user,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
