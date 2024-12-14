const express = require('express');
const router = express.Router();
const List = require('../models/listModel'); 
const User = require('../models/userModel'); 
const Notification = require('../models/notificationModel'); 
const { protect } = require('../middleware/authMiddleware'); 

// PATCH update list completion status
router.patch('/:listId', protect, async (req, res) => {
  try {
    const { listId } = req.params;
    const { isCompleted, completedItems } = req.body;

    console.log('Update list route hit:', {
      listId,
      isCompleted,
      completedItems
    });

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Update completion status
    list.isCompleted = isCompleted;

    // Update items completion status
    if (completedItems && Array.isArray(completedItems)) {
      list.items = list.items.map(item => ({
        ...item.toObject(),
        checked: completedItems.includes(item._id.toString())
      }));
    }

    await list.save();
    res.json(list);
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ message: 'Failed to update list' });
  }
});

// DELETE items from list
router.delete('/:listId/items', protect, async (req, res) => {
  try {
    const { listId } = req.params;
    const { itemIds } = req.body;

    console.log('Delete route hit:', {
      listId,
      itemIds,
      body: req.body
    });

    if (!itemIds || !Array.isArray(itemIds)) {
      return res.status(400).json({ message: 'Invalid item IDs provided' });
    }

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Remove specified items
    const originalLength = list.items.length;
    list.items = list.items.filter(item => !itemIds.includes(item._id.toString()));
    const newLength = list.items.length;

    console.log(`Removed ${originalLength - newLength} items`);

    await list.save();
    res.status(200).json(list);
  } catch (error) {
    console.error('Error in delete route:', error);
    res.status(500).json({ message: 'Failed to delete items' });
  }
});

// GET list items
router.get('/:listId/items', protect, async (req, res) => {
  try {
    const list = await List.findById(req.params.listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }
    res.json(list.items);
  } catch (error) {
    console.error('Error fetching list items:', error);
    res.status(500).json({ message: 'Failed to fetch list items' });
  }
});

// GET single list
router.get('/:listId', protect, async (req, res) => {
  try {
    console.log('Fetching list with ID:', req.params.listId); // Debug log
    
    const list = await List.findById(req.params.listId);
    console.log('Found list:', list); // Debug log
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Return the entire list object which includes items
    res.json(list);
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({ message: 'Error fetching list' });
  }
});

// POST add items to a list
router.post('/:listId/items', protect, async (req, res) => {
  try {
    const { listId } = req.params;
    const { 
      name, 
      quantity, 
      category, 
      categoryDetails 
    } = req.body;
    
    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    const list = await List.findById(listId);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Create new item with category details
    const newItem = {
      name: name.trim(),
      quantity: quantity || '',
      category: category || 'uncategorized',
      categoryDetails: categoryDetails || {
        id: 'uncategorized',
        name: 'Uncategorized',
        image: null
      },
      checked: false
    };

    // Add item to list
    list.items.push(newItem);
    await list.save();

    res.status(201).json(list);
  } catch (error) {
    console.error('Error adding item to list:', error);
    res.status(500).json({ message: 'Failed to add item to list', error: error.message });
  }
});

// PATCH toggle item completion status
router.patch('/:listId/items/:itemId/toggle', protect, async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    
    // Find the list first
    const list = await List.findById(listId);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Find the specific item
    const itemIndex = list.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Toggle the checked status
    list.items[itemIndex].checked = !list.items[itemIndex].checked;

    // Save the updated list
    await list.save();

    res.json(list);
  } catch (error) {
    console.error('Error toggling item:', error);
    res.status(500).json({ message: 'Failed to toggle item', error: error.message });
  }
});

// DELETE list
router.delete('/:listId', protect, async (req, res) => {
  try {
    const { listId } = req.params;
    
    // Find and delete the list
    const deletedList = await List.findByIdAndDelete(listId);
    
    if (!deletedList) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.status(200).json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ message: 'Failed to delete list' });
  }
});

// GET all user lists
router.get('/', protect, async (req, res) => {
  try {
    // Find all lists for the logged-in user, sorted by most recently updated
    const lists = await List.find({ user: req.user._id })
      .sort({ updatedAt: -1, createdAt: -1 }); // Sort by most recently updated

    res.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ message: 'Failed to fetch lists' });
  }
});

// POST create a new list
router.post('/', protect, async (req, res) => {
  try {
    console.log('Create list route hit');
    console.log('Request body:', req.body);
    console.log('User:', req.user);

    const { title } = req.body;

    // Validate title
    if (!title || title.trim().length === 0) {
      console.log('Invalid title');
      return res.status(400).json({ message: 'List title is required' });
    }

    // Create new list
    const newList = new List({
      title: title.trim(),
      user: req.user._id,  // Assuming the protect middleware adds the user to the request
      items: [],
      isCompleted: false
    });

    // Save the list
    await newList.save();
    newList.updatedAt = new Date();
    await newList.save();

    console.log('List created successfully:', newList);

    res.status(201).json(newList);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ message: 'Failed to create list', error: error.message });
  }
});

// POST share list with another registered user
router.post('/:listId/share', protect, async (req, res, next) => {
  try {
    const { listId } = req.params;
    const { recipientEmail } = req.body;
    const senderId = req.user._id;

    // Extensive logging for debugging
    console.log('Share List Request - FULL DETAILS:', { 
      listId, 
      recipientEmail, 
      senderId,
      senderName: req.user.name,
      senderEmail: req.user.email,
      requestBody: req.body,
      requestParams: req.params,
      requestUser: req.user
    });

    // Validate inputs with more detailed checks
    if (!recipientEmail || typeof recipientEmail !== 'string') {
      console.error('Invalid recipient email:', recipientEmail);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid recipient email',
        details: {
          recipientEmail,
          type: typeof recipientEmail
        }
      });
    }

    // Find the list to be shared
    let list;
    try {
      list = await List.findById(listId);
    } catch (findError) {
      console.error('Error finding list:', {
        listId,
        findError: findError.message,
        findErrorStack: findError.stack
      });
      return next(new Error(`Database error while finding list: ${findError.message}`));
    }

    if (!list) {
      console.error('List not found:', { listId });
      return res.status(404).json({ 
        success: false,
        message: 'List not found',
        details: { listId }
      });
    }

    // Verify list ownership
    if (list.user.toString() !== senderId.toString()) {
      console.error('Unauthorized list share attempt:', {
        listOwnerId: list.user.toString(),
        currentUserId: senderId.toString()
      });
      return res.status(403).json({ 
        success: false,
        message: 'You do not have permission to share this list' 
      });
    }

    // Find the recipient user
    let recipientUser;
    try {
      recipientUser = await User.findOne({ email: recipientEmail });
    } catch (userFindError) {
      console.error('Error finding recipient user:', {
        recipientEmail,
        userFindError: userFindError.message,
        userFindErrorStack: userFindError.stack
      });
      return next(new Error(`Database error while finding recipient: ${userFindError.message}`));
    }

    if (!recipientUser) {
      console.error('Recipient user not found:', { recipientEmail });
      return res.status(400).json({ 
        success: false,
        message: 'Recipient user not found',
        details: { recipientEmail }
      });
    }

    // Validate list items before creating notification
    if (!list.items || !Array.isArray(list.items)) {
      console.error('Invalid list items:', { 
        listId, 
        items: list.items,
        itemsType: typeof list.items 
      });
      return res.status(400).json({ 
        success: false,
        message: 'Invalid list items',
        details: { 
          listId, 
          items: list.items,
          itemsType: typeof list.items 
        }
      });
    }

    // Create a notification for the shared list
    let notification;
    try {
      notification = new Notification({
        recipient: recipientUser._id,
        sender: senderId,
        type: 'LIST_SHARED',
        message: `${req.user.name} shared a list "${list.title}" with you`,
        relatedList: list._id,
        listDetails: {
          title: list.title,
          items: list.items.map(item => ({
            name: item.name || '',
            quantity: item.quantity || '',
            checked: item.checked || false
          }))
        }
      });

      await notification.save();
    } catch (notificationError) {
      console.error('Error creating notification:', {
        notificationError: notificationError.message,
        notificationErrorStack: notificationError.stack,
        notificationData: {
          recipient: recipientUser._id,
          sender: senderId,
          listTitle: list.title
        }
      });
      return next(new Error(`Failed to create notification: ${notificationError.message}`));
    }

    console.log('List shared successfully:', {
      notificationId: notification._id,
      recipientId: recipientUser._id,
      listTitle: list.title
    });

    res.status(200).json({ 
      success: true,
      message: 'List shared successfully', 
      notificationId: notification._id 
    });

  } catch (error) {
    console.error('Unhandled error in share list route:', {
      error: error.message,
      errorStack: error.stack,
      requestBody: req.body,
      requestParams: req.params
    });
    
    // Pass to global error handler
    next(error);
  }
});

// POST accept a shared list
router.post('/accept-shared', protect, async (req, res, next) => {
  try {
    const { notificationId, listId } = req.body;
    const recipientId = req.user._id;

    console.log('Accept Shared List Request:', { 
      notificationId, 
      listId, 
      recipientId 
    });

    // Find the notification
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    // Verify the notification is for this user
    if (notification.recipient.toString() !== recipientId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'You are not authorized to accept this list' 
      });
    }

    // Find the original list
    const originalList = await List.findById(listId);
    if (!originalList) {
      return res.status(404).json({ 
        success: false,
        message: 'List not found' 
      });
    }

    // Find the sender (original list owner)
    const sender = await User.findById(originalList.user);
    if (!sender) {
      return res.status(404).json({ 
        success: false,
        message: 'Sender not found' 
      });
    }

    // Find the recipient user
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ 
        success: false,
        message: 'Recipient not found' 
      });
    }

    // Create a new list for the recipient
    const newList = new List({
      title: originalList.title,
      description: originalList.description,
      user: recipientId,
      category: originalList.category,
      items: originalList.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        checked: false  // Reset checked status
      }))
    });

    await newList.save();

    // Create a notification for the original sender
    const senderNotification = new Notification({
      type: 'LIST_ACCEPTED',
      recipient: sender._id,
      sender: recipientId,
      message: `${recipient.name} accepted your shared list "${originalList.title}"`,
      relatedList: originalList._id,
      read: false
    });

    await senderNotification.save();

    // Mark the original notification as read
    notification.read = true;
    await notification.save();

    console.log('Shared list accepted successfully:', {
      newListId: newList._id,
      originalListId: listId,
      recipientId,
      senderNotificationId: senderNotification._id
    });

    res.status(200).json({ 
      success: true,
      message: 'List accepted successfully', 
      newListId: newList._id 
    });

  } catch (error) {
    console.error('Error accepting shared list:', {
      error: error.message,
      errorStack: error.stack,
      requestBody: req.body
    });
    
    next(error);
  }
});

module.exports = router;
