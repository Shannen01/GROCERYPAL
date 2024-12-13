const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const { 
  createList, 
  getLists, 
  getListById,
  updateList,
  addItem,
  updateItem,
  deleteItem,
  deleteList,
  getListItems
} = require('../controllers/listController');
const List = require('../models/listModel');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

// Detailed error logging function
const logDetailedError = (error, context = {}) => {
  console.error('Detailed Error Log:', {
    errorName: error.name,
    errorMessage: error.message,
    errorStack: error.stack,
    ...context
  });
};

// List routes
router.post('/', protect, createList);
router.get('/', protect, getLists);
router.get('/:id', protect, getListById);
router.put('/:id', protect, updateList);
router.delete('/:id', protect, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if the list belongs to the current user
    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this list' });
    }

    await List.findByIdAndDelete(req.params.id);
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ message: 'Error deleting list' });
  }
});

// Item routes
router.get('/:id/items', protect, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    
    // Check if the list belongs to the current user
    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this list' });
    }
    
    // Return items or an empty array
    res.json(list.items || []);
  } catch (error) {
    console.error('Error fetching list items:', error);
    res.status(500).json({ 
      message: 'Error fetching list items',
      details: error.message
    });
  }
});
router.post('/:id/items', protect, addItem);
router.put('/:id/items/:itemId', protect, updateItem);
router.patch('/:id/items/:itemId', protect, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if the list belongs to the current user
    if (list.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this list' });
    }

    const item = list.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Update only the fields that are provided
    if (req.body.isCompleted !== undefined) {
      item.isCompleted = req.body.isCompleted;
    }
    if (req.body.name !== undefined) {
      item.name = req.body.name;
    }
    if (req.body.quantity !== undefined) {
      item.quantity = req.body.quantity;
    }

    await list.save();
    res.json(list);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Error updating item' });
  }
});
router.delete('/:id/items/:itemId', protect, deleteItem);

// Route to accept a shared list
router.post('/accept-shared', protect, async (req, res) => {
  // Start with comprehensive request logging
  console.log('Incoming accept-shared request:', {
    body: req.body,
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
    }
  });

  try {
    const { notificationId, listId } = req.body;

    // Validate inputs with detailed checks
    if (!notificationId) {
      console.warn('Missing notification ID');
      return res.status(400).json({ 
        success: false, 
        message: 'Notification ID is required',
        errorCode: 'MISSING_NOTIFICATION_ID'
      });
    }

    if (!listId) {
      console.warn('Missing list ID');
      return res.status(400).json({ 
        success: false, 
        message: 'List ID is required',
        errorCode: 'MISSING_LIST_ID'
      });
    }

    // Validate ID formats
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      console.warn('Invalid list ID format:', { listId });
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid list ID format',
        errorCode: 'INVALID_LIST_ID'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      console.warn('Invalid notification ID format:', { notificationId });
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid notification ID format',
        errorCode: 'INVALID_NOTIFICATION_ID'
      });
    }

    // Find the notification with detailed population
    const notification = await Notification.findById(notificationId)
      .populate({
        path: 'sender',
        select: 'name email'
      })
      .populate({
        path: 'relatedList',
        select: 'title user sharedWith'
      });

    if (!notification) {
      console.warn('Notification not found:', { 
        notificationId,
        userId: req.user._id 
      });
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found',
        errorCode: 'NOTIFICATION_NOT_FOUND'
      });
    }

    // Check if notification is already accepted
    if (notification.status === 'ACCEPTED') {
      console.warn('Notification already accepted:', { 
        notificationId,
        userId: req.user._id 
      });
      return res.status(400).json({ 
        success: false, 
        message: 'This list has already been accepted',
        errorCode: 'ALREADY_ACCEPTED'
      });
    }

    // Find the list with additional details
    const list = await List.findById(listId)
      .populate('user', 'name email');

    if (!list) {
      console.warn('List not found:', { 
        listId,
        userId: req.user._id 
      });
      return res.status(404).json({ 
        success: false, 
        message: 'List not found',
        errorCode: 'LIST_NOT_FOUND'
      });
    }

    // Check if the list is already shared with the user
    const isAlreadyShared = list.sharedWith.some(
      sharedUser => sharedUser.toString() === req.user._id.toString()
    );

    if (isAlreadyShared) {
      console.warn('List already shared with user:', { 
        listId,
        userId: req.user._id 
      });
      return res.status(400).json({ 
        success: false, 
        message: 'This list is already shared with you',
        errorCode: 'LIST_ALREADY_SHARED'
      });
    }

    // Add the current user to the list's sharedWith array
    list.sharedWith.push(req.user._id);
    await list.save();

    // Update the notification to mark it as accepted
    notification.status = 'ACCEPTED';
    notification.read = true;
    await notification.save();

    // Create a notification for the original list owner
    const senderNotification = await Notification.create({
      recipient: list.user._id,
      sender: req.user._id,
      type: 'LIST_ACCEPTED',
      message: `${req.user.name} accepted your shared list: ${list.title}`,
      relatedList: listId,
      listDetails: {
        title: list.title
      }
    });

    // Detailed success logging
    console.log('List acceptance processed successfully:', {
      listId,
      listTitle: list.title,
      acceptedUserId: req.user._id,
      acceptedUserName: req.user.name,
      originalOwnerId: list.user._id,
      originalOwnerName: list.user.name
    });

    // Return a comprehensive success response
    res.status(200).json({ 
      success: true, 
      message: 'List sharing request accepted',
      notification: {
        _id: notification._id,
        status: notification.status,
        read: notification.read,
        message: notification.message
      },
      senderNotification: {
        _id: senderNotification._id,
        message: senderNotification.message
      }
    });

  } catch (error) {
    // Comprehensive error handling and logging
    console.error('Detailed error when accepting shared list:', {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      validationErrors: error.errors ? Object.keys(error.errors).map(key => ({
        path: key,
        message: error.errors[key].message
      })) : null,
      route: 'accept-shared',
      userId: req.user._id,
      userEmail: req.user.email,
      requestBody: req.body
    });

    // Send a detailed error response
    res.status(500).json({ 
      success: false, 
      message: 'Unexpected error accepting shared list',
      errorCode: 'INTERNAL_SERVER_ERROR',
      details: {
        errorMessage: error.message,
        errorName: error.name,
        validationErrors: error.errors ? Object.keys(error.errors).map(key => ({
          path: key,
          message: error.errors[key].message
        })) : null
      }
    });
  }
});

// Route to share a list with another user
router.post('/:id/share', protect, async (req, res) => {
  // EXTREME DEBUGGING: Log absolutely everything
  console.log('EXTREME DEBUG - SHARE LIST ROUTE', {
    requestBody: req.body,
    requestParams: req.params,
    requestHeaders: req.headers,
    userDetails: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
    },
    fullRequest: req
  });

  try {
    const { recipientEmail } = req.body;
    const listId = req.params.id;

    // Validate input with extensive logging
    if (!recipientEmail) {
      console.warn('Share list failed: No recipient email', { 
        listId, 
        userId: req.user._id 
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient email is required' 
      });
    }

    // Validate list ID
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      console.warn('Share list failed: Invalid list ID', { 
        listId, 
        userId: req.user._id 
      });
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid list ID' 
      });
    }

    // Find the list with full details and extensive error handling
    let list;
    try {
      list = await List.findById(listId)
        .populate('user', 'name email')
        .populate('category', 'name');
    } catch (findError) {
      console.error('Database error finding list:', {
        listId,
        errorName: findError.name,
        errorMessage: findError.message,
        errorStack: findError.stack
      });
      return res.status(500).json({ 
        success: false, 
        message: 'Database error finding list',
        details: findError.message
      });
    }

    // Check if list exists
    if (!list) {
      console.warn('Share list failed: List not found', { 
        listId, 
        userId: req.user._id 
      });
      return res.status(404).json({ 
        success: false, 
        message: 'List not found' 
      });
    }

    // Verify list ownership with detailed logging
    if (!list.user || list.user._id.toString() !== req.user._id.toString()) {
      console.warn('Share list failed: Unauthorized list access', { 
        listId, 
        listOwnerId: list.user?._id,
        currentUserId: req.user._id 
      });
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to share this list' 
      });
    }

    // Find the recipient user with error handling
    let recipient;
    try {
      recipient = await User.findOne({ email: recipientEmail });
    } catch (userFindError) {
      console.error('Database error finding recipient:', {
        recipientEmail,
        errorName: userFindError.name,
        errorMessage: userFindError.message,
        errorStack: userFindError.stack
      });
      return res.status(500).json({ 
        success: false, 
        message: 'Database error finding recipient',
        details: userFindError.message
      });
    }

    // Check if recipient exists
    if (!recipient) {
      console.warn('Share list failed: Recipient not found', { 
        recipientEmail, 
        userId: req.user._id 
      });
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient user not found' 
      });
    }

    // Check if the list is already shared with this user
    const isAlreadyShared = list.sharedWith.some(
      sharedUser => sharedUser.toString() === recipient._id.toString()
    );

    if (isAlreadyShared) {
      console.warn('Share list failed: Already shared', { 
        listId, 
        recipientId: recipient._id,
        userId: req.user._id 
      });
      return res.status(400).json({ 
        success: false, 
        message: 'List is already shared with this user' 
      });
    }

    // Add recipient to sharedWith array with error handling
    try {
      list.sharedWith.push(recipient._id);
      await list.save();
    } catch (saveError) {
      console.error('Error saving shared list:', {
        listId,
        recipientId: recipient._id,
        errorName: saveError.name,
        errorMessage: saveError.message,
        errorStack: saveError.stack
      });
      return res.status(500).json({ 
        success: false, 
        message: 'Error updating list sharing',
        details: saveError.message
      });
    }

    // Create a comprehensive notification for the recipient
    let notification;
    try {
      // Validate list items before processing
      if (!Array.isArray(list.items)) {
        throw new Error('List items must be an array');
      }

      // Safely prepare list items with extensive error checking
      const safeListItems = list.items.reduce((acc, item, index) => {
        try {
          // Validate each item
          if (typeof item !== 'object' || item === null) {
            console.warn(`Invalid item type at index ${index}:`, { 
              item, 
              type: typeof item 
            });
            return acc;
          }

          // Ensure name exists and is a non-empty string
          const itemName = item.name && typeof item.name === 'string' 
            ? item.name.trim() 
            : '';

          if (!itemName) {
            console.warn(`Skipping item with invalid name at index ${index}:`, { 
              item, 
              name: item.name 
            });
            return acc;
          }

          // Add validated item
          acc.push({
            name: itemName,
            quantity: (item.quantity && typeof item.quantity === 'string') 
              ? item.quantity.trim() 
              : '',
            unit: (item.unit && typeof item.unit === 'string') 
              ? item.unit.trim() 
              : '',
            checked: !!item.checked
          });

          return acc;
        } catch (itemError) {
          console.error(`Error processing list item at index ${index}:`, {
            error: itemError,
            item: item
          });
          return acc;
        }
      }, []);

      // Check if we have any valid items
      if (safeListItems.length === 0) {
        throw new Error('No valid list items found');
      }

      // Create notification with safe data
      notification = await Notification.create({
        recipient: recipient._id,
        sender: req.user._id,
        type: 'LIST_SHARED',
        message: `${req.user.name} shared a list with you: ${list.title}`,
        relatedList: list._id,
        listDetails: {
          title: list.title || '',
          description: list.description || '',
          category: list.category ? list.category.name : '',
          ownerName: list.user.name || '',
          ownerEmail: list.user.email || '',
          items: safeListItems,
          createdAt: list.createdAt || new Date(),
          itemCount: safeListItems.length
        },
        status: 'PENDING'
      });
    } catch (notificationError) {
      console.error('Error creating notification:', {
        listId,
        recipientId: recipient._id,
        errorName: notificationError.name,
        errorMessage: notificationError.message,
        errorStack: notificationError.stack,
        listDetails: {
          title: list.title,
          originalItems: list.items,
          itemCount: list.items.length
        }
      });
      return res.status(500).json({ 
        success: false, 
        message: 'Error creating notification',
        details: notificationError.message
      });
    }

    // Log the sharing action with comprehensive details
    console.log('List sharing successful:', {
      listId: list._id,
      listTitle: list.title,
      senderUserId: req.user._id,
      senderUserName: req.user.name,
      recipientUserId: recipient._id,
      recipientUserEmail: recipient.email,
      notificationId: notification._id,
      itemCount: list.items.length
    });

    // Return success response with full list details
    res.status(200).json({ 
      success: true, 
      message: 'List shared successfully',
      notification: {
        _id: notification._id,
        message: notification.message,
        listDetails: notification.listDetails
      }
    });

  } catch (globalError) {
    // Catch-all error handler with extensive logging
    console.error('GLOBAL ERROR in list sharing:', {
      errorName: globalError.name,
      errorMessage: globalError.message,
      errorStack: globalError.stack,
      requestBody: req.body,
      requestParams: req.params,
      userId: req.user?._id
    });

    // Send detailed error response
    res.status(500).json({ 
      success: false, 
      message: 'Unexpected global error sharing list',
      errorCode: 'GLOBAL_SHARE_ERROR',
      details: {
        errorMessage: globalError.message,
        errorName: globalError.name
      }
    });
  }
});

module.exports = router;
