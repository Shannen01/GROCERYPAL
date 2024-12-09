const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Authentication routes with proper error handling
router.post('/register', async (req, res) => {
    try {
        await registerUser(req, res);
    } catch (error) {
        console.error('Registration route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        await loginUser(req, res);
    } catch (error) {
        console.error('Login route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});

module.exports = router;