const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/notificationModel');
const mongoose = require('mongoose');

// Get all notifications for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email')
      .populate('relatedList', 'title');

    // Transform notifications to include full details and ensure status
    const transformedNotifications = notifications.map(notification => ({
      ...notification.toObject(),
      // Ensure status is always set, default to PENDING if not present
      status: notification.status || 'PENDING',
      // Ensure listDetails are included even if not populated
      listDetails: notification.listDetails || {
        title: notification.relatedList?.title || 'Unnamed List',
        items: []
      }
    }));

    // Detailed logging of notifications
    console.log('Fetched Notifications for User', {
      userId: req.user.id,
      notificationCount: transformedNotifications.length,
      notificationStatuses: transformedNotifications.map(n => n.status)
    });

    res.json(transformedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', {
      errorMessage: error.message,
      userId: req.user.id
    });
    res.status(500).json({ 
      message: 'Error fetching notifications',
      error: error.message 
    });
  }
});

// Mark a notification as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Delete a specific notification
router.delete('/:id', protect, async (req, res) => {
  // Log incoming delete request details
  console.log('Incoming DELETE notification request:', {
    notificationId: req.params.id,
    userId: req.user.id,
    userEmail: req.user.email,
    fullRequestBody: req.body,
    requestHeaders: req.headers
  });

  try {
    // Validate notification ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.warn('Invalid notification ID format:', {
        notificationId: req.params.id,
        userId: req.user.id
      });

      return res.status(400).json({ 
        success: false,
        message: 'Invalid notification ID' 
      });
    }

    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      console.warn('Notification not found or unauthorized deletion attempt:', {
        attemptedNotificationId: req.params.id,
        requestingUserId: req.user.id
      });

      return res.status(404).json({ 
        success: false,
        message: 'Notification not found or you are not authorized to delete it' 
      });
    }

    // Delete the notification
    const deleteResult = await Notification.deleteOne({ _id: req.params.id });

    // Verify deletion
    if (deleteResult.deletedCount === 0) {
      console.error('Notification deletion failed:', {
        notificationId: req.params.id,
        userId: req.user.id,
        deleteResult: deleteResult
      });

      return res.status(500).json({ 
        success: false,
        message: 'Failed to delete notification' 
      });
    }

    // Log the deletion for debugging
    console.log('Notification deleted successfully:', {
      notificationId: req.params.id,
      userId: req.user.id
    });

    res.status(200).json({ 
      success: true,
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('Unexpected error deleting notification:', {
      error: error.message,
      errorStack: error.stack,
      notificationId: req.params.id,
      userId: req.user.id
    });

    res.status(500).json({ 
      success: false,
      message: 'Unexpected error deleting notification' 
    });
  }
});

module.exports = router;
