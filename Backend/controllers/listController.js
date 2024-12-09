const List = require('../models/listModel');

// Create a new list
const createList = async (req, res) => {
    try {
        const { title, description, category, items } = req.body;
        const list = await List.create({
            title,
            description,
            category,
            items: items || [],
            user: req.user._id
        });
        res.status(201).json(list);
    } catch (error) {
        console.error('Error creating list:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all lists for a user
const getLists = async (req, res) => {
    try {
        const lists = await List.find({ user: req.user._id })
            .populate('category')
            .sort('-createdAt');
        res.json(lists);
    } catch (error) {
        console.error('Error fetching lists:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get a single list by ID
const getListById = async (req, res) => {
    try {
        const list = await List.findById(req.params.id).populate('category');
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        if (list.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(list);
    } catch (error) {
        console.error('Error fetching list:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update a list
const updateList = async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        if (list.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        const { title, description, category, items } = req.body;
        list.title = title || list.title;
        list.description = description || list.description;
        list.category = category || list.category;
        list.items = items || list.items;
        
        const updatedList = await list.save();
        res.json(updatedList);
    } catch (error) {
        console.error('Error updating list:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add an item to a list
const addItem = async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        if (list.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        const { name, quantity, unit } = req.body;
        list.items.push({ name, quantity, unit });
        const updatedList = await list.save();
        res.json(updatedList);
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update an item in a list
const updateItem = async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        if (list.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        const item = list.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        
        const { name, quantity, unit, checked } = req.body;
        item.name = name || item.name;
        item.quantity = quantity || item.quantity;
        item.unit = unit || item.unit;
        item.checked = checked !== undefined ? checked : item.checked;
        
        const updatedList = await list.save();
        res.json(updatedList);
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete an item from a list
const deleteItem = async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        if (list.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        list.items = list.items.filter(item => item._id.toString() !== req.params.itemId);
        const updatedList = await list.save();
        res.json(updatedList);
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete a list
const deleteList = async (req, res) => {
    try {
        const list = await List.findById(req.params.id);
        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }
        if (list.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        await List.findByIdAndDelete(req.params.id);
        res.json({ message: 'List deleted successfully' });
    } catch (error) {
        console.error('Error deleting list:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createList,
    getLists,
    getListById,
    updateList,
    addItem,
    updateItem,
    deleteItem,
    deleteList
};
