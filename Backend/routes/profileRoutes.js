const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, uploadProfileImage } = require('../controllers/profileController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Routes
router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/upload-image', protect, upload.single('image'), uploadProfileImage);

module.exports = router;
