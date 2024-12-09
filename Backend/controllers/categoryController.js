const Category = require('../models/categoryModel');

// Get all categories
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort('name');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: error.message });
    }
};

// Create a new category
const createCategory = async (req, res) => {
    try {
        const { name, description, color } = req.body;
        const category = await Category.create({
            name,
            description,
            color
        });
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update a category
const updateCategory = async (req, res) => {
    try {
        const { name, description, color } = req.body;
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        category.name = name || category.name;
        category.description = description || category.description;
        category.color = color || category.color;
        
        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete a category
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
