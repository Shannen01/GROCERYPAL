const User = require('../models/userModel');
const jwt = require('jsonwebtoken'); // Added jwt import

const registerUser = async (req, res) => {
    try {
        console.log('Registration request body:', req.body);
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide all required fields' 
            });
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: 'Please enter a valid email' 
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                message: 'Password must be at least 6 characters' 
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists' 
            });
        }

        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin
                }
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        // Send response
        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                image: user.image
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
};

module.exports = {
    registerUser,
    loginUser
};
