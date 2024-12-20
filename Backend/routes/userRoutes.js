const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { updateProfile } = require('../controllers/profileController');
const User = require('../models/userModel');
const List = require('../models/listModel');

// User profile routes
router.route('/profile').put(protect, updateProfile);

// Verify email for list sharing
router.get('/verify-email', protect, async (req, res) => {
  try {
    const { email } = req.query;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        isRegistered: false, 
        message: 'Invalid email format' 
      });
    }

    // Check if the email exists in the database
    const user = await User.findOne({ email });
    
    if (user) {
      // User exists and is registered
      res.json({ 
        isRegistered: true, 
        userId: user._id 
      });
    } else {
      // User is not registered
      res.json({ 
        isRegistered: false, 
        message: 'Email not registered' 
      });
    }
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ 
      isRegistered: false, 
      message: 'Server error during email verification' 
    });
  }
});

// Delete user account
router.delete('/delete-account', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // First delete all lists associated with the user
    await List.deleteMany({ user: req.user.id });

    // Then delete the user
    await User.findByIdAndDelete(req.user.id);
    
    res.json({ success: true, message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Error deleting account' });
  }
});

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
