const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    items: [{
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: String,
            default: ''
        },
        unit: String,
        checked: {
            type: Boolean,
            default: false
        },
        category: {
            type: String,
            default: 'uncategorized'
        },
        categoryDetails: {
            id: {
                type: String,
                default: 'uncategorized'
            },
            name: {
                type: String,
                default: 'Uncategorized'
            },
            image: {
                type: String,
                default: null
            }
        }
    }],
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true  // This adds createdAt and updatedAt fields
});

const List = mongoose.model('List', listSchema);
module.exports = List;
