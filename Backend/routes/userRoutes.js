const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateProfile } = require('../controllers/profileController');
const User = require('../models/userModel');

// User profile routes
router.route('/profile').put(protect, updateProfile);

// Check if email exists
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (user) {
      res.json({ exists: true, userId: user._id });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
