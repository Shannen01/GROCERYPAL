const User = require('../models/userModel');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                image: user.image
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving profile'
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields if provided
        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.password) user.password = req.body.password;

        const updatedUser = await user.save();

        res.json({
            success: true,
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                image: updatedUser.image
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
    try {
        console.log('Upload Profile Image Request:', {
            user: req.user ? req.user.id : 'No user',
            file: req.file,
            body: req.body,
            headers: req.headers
        });

        // Extensive file validation
        if (!req.file) {
            console.error('No file uploaded', {
                body: req.body,
                files: req.files,
                fieldname: req.fieldname
            });
            return res.status(400).json({
                success: false,
                message: 'No image file provided',
                details: {
                    body: Object.keys(req.body),
                    files: req.files ? Object.keys(req.files) : 'No files object'
                }
            });
        }

        // Validate file size and type
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (req.file.size > maxSize) {
            console.error('File too large', {
                fileSize: req.file.size,
                maxAllowedSize: maxSize
            });
            return res.status(400).json({
                success: false,
                message: 'File size exceeds 5MB limit'
            });
        }

        if (!allowedTypes.includes(req.file.mimetype)) {
            console.error('Invalid file type', {
                fileMimeType: req.file.mimetype,
                allowedTypes: allowedTypes
            });
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only JPEG, PNG, and GIF are allowed'
            });
        }

        // Ensure user exists and is authenticated
        if (!req.user || !req.user.id) {
            console.error('Unauthorized upload attempt', {
                user: req.user,
                authentication: req.headers.authorization
            });
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: User not authenticated'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            console.error('User not found', {
                userId: req.user.id
            });
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Create image URL
        const imageUrl = `/uploads/${req.file.filename}`;
        
        // Additional file system checks
        const fs = require('fs');
        const path = require('path');
        const fullPath = path.join(__dirname, '../', imageUrl);
        
        if (!fs.existsSync(path.dirname(fullPath))) {
            console.error('Upload directory does not exist', {
                directory: path.dirname(fullPath)
            });
            return res.status(500).json({
                success: false,
                message: 'Upload directory does not exist'
            });
        }

        // Update user profile
        user.image = imageUrl;
        
        try {
            await user.save();
        } catch (saveError) {
            console.error('Error saving user profile', {
                error: saveError,
                userId: user._id,
                imageUrl: imageUrl
            });
            return res.status(500).json({
                success: false,
                message: 'Error updating user profile',
                details: saveError.message
            });
        }

        console.log('Profile Image Updated:', {
            userId: user._id,
            imageUrl: imageUrl,
            fileDetails: {
                originalName: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });

        res.json({
            success: true,
            imageUrl,
            message: 'Profile image updated successfully'
        });
    } catch (error) {
        // Catch-all error handler with extensive logging
        console.error('CRITICAL: Upload profile image error', {
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack,
            requestDetails: {
                user: req.user ? req.user.id : 'No user',
                file: req.file,
                body: req.body
            }
        });

        res.status(500).json({
            success: false,
            message: 'Internal server error during image upload',
            errorId: require('crypto').randomBytes(16).toString('hex'),
            details: {
                message: error.message,
                name: error.name
            }
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    uploadProfileImage
};
