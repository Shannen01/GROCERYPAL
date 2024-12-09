const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createList, 
  getLists, 
  getListById,
  updateList,
  addItem,
  updateItem,
  deleteItem,
  deleteList
} = require('../controllers/listController');
const List = require('../models/listModel');

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

module.exports = router;
