const mongoose = require('mongoose');

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
    required: true,
    enum: ['LIST_SHARED']
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
    title: {
      type: String,
      required: true
    },
    items: [{
      name: String,
      quantity: String,
      checked: Boolean
    }]
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
