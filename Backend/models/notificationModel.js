const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    default: ''
  },
  unit: {
    type: String,
    default: ''
  },
  checked: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['LIST_SHARED', 'LIST_ACCEPTED', 'LIST_REJECTED', 'FRIEND_REQUEST'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  },
  listDetails: {
    title: String,
    description: String,
    category: String,
    ownerName: String,
    ownerEmail: String,
    items: [listItemSchema],
    createdAt: Date,
    itemCount: Number
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'ARCHIVED'],
    default: 'PENDING'
  },
  read: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
