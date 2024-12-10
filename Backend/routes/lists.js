const express = require('express');
const router = express.Router();
const List = require('../models/List');
const { authenticateToken } = require('../middleware/auth');

// IMPORTANT: Put this route FIRST, before other routes
router.delete('/:listId/items', authenticateToken, async (req, res) => {
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

    // Filter out the items that should be deleted
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

// Get list items
router.get('/:listId/items', authenticateToken, async (req, res) => {
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

// Get single list
router.get('/:listId', authenticateToken, async (req, res) => {
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

// Add items to a list
router.post('/:listId/items', authenticateToken, async (req, res) => {
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

// Toggle item completion status
router.patch('/:listId/items/:itemId/toggle', authenticateToken, async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    
    const list = await List.findOneAndUpdate(
      { 
        _id: listId,
        'items._id': itemId 
      },
      [
        {
          $set: {
            'items.$[elem].isCompleted': {
              $not: ['$items.$[elem].isCompleted']
            }
          }
        }
      ],
      {
        arrayFilters: [{ 'elem._id': itemId }],
        new: true
      }
    );

    if (!list) {
      return res.status(404).json({ message: 'List or item not found' });
    }

    res.json(list);
  } catch (error) {
    console.error('Error toggling item:', error);
    res.status(500).json({ message: 'Failed to toggle item' });
  }
});

// Add this route to handle list deletion
router.delete('/:listId', authenticateToken, async (req, res) => {
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

// Add this route for getting recent lists (limit to 2)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const lists = await List.find({ owner: req.user._id })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .limit(2); // Limit to 2 lists
    
    res.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ message: 'Failed to fetch lists' });
  }
});

module.exports = router; 