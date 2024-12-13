const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Protect routes middleware
const protect = async (req, res, next) => {
  try {
    let token;

    // Log incoming headers for debugging
    console.log('Request Headers:', req.headers);

    // Check for token in Authorization header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Extracted Token:', token);
    }

    if (!token) {
      console.log('No token found');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded Token:', decoded);

      // Get user from database (exclude password)
      const user = await User.findById(decoded.id).select('-password');
      console.log('Found User:', user);

      if (!user) {
        console.log('User not found');
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Add user to request object
      req.user = user;
      next();

    } catch (error) {
      console.log('Token Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }

  } catch (error) {
    console.log('Authentication Middleware Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Optional auth middleware - doesn't require authentication but attaches user if token present
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Invalid token - just continue without user
        req.user = null;
      }
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    next();
  }
};

// Admin middleware - checks if user is an admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as admin'
    });
  }
};

module.exports = { protect, optionalAuth, admin };
