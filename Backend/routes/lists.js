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
    const { name, quantity, category } = req.body;
    
    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    const list = await List.findById(listId);
    
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Create new item
    const newItem = {
      name: name.trim(),
      quantity: quantity || '',
      category: category || '',
      isCompleted: false
    };

    // Add item to list
    list.items.push(newItem);
    await list.save();

    res.status(201).json(list);
  } catch (error) {
    console.error('Error adding item to list:', error);
    res.status(500).json({ message: 'Failed to add item to list' });
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
      .sort({ updatedAt: -1 }); // Sort by most recently updated

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
    console.log('List created successfully:', newList);

    res.status(201).json(newList);
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ message: 'Failed to create list', error: error.message });
  }
});

// POST share list with another user
router.post('/:id/share', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { recipientEmail } = req.body;

    // Find the list to be shared
    const originalList = await List.findById(id);
    if (!originalList) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Find the recipient user
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    // Prevent sharing with self
    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot share a list with yourself' });
    }

    // Create a notification for the recipient
    const notification = new Notification({
      user: recipient._id,
      type: 'list_shared',
      message: `${req.user.name} shared a list "${originalList.title}" with you`,
      data: {
        originalListId: originalList._id,
        sharedBy: req.user._id,
        listTitle: originalList.title,
        listItems: originalList.items
      }
    });

    await notification.save();

    res.status(201).json({ 
      message: 'List shared successfully', 
      notificationId: notification._id 
    });
  } catch (error) {
    console.error('Error sharing list:', error);
    res.status(500).json({ message: 'Failed to share list' });
  }
});

module.exports = router;
