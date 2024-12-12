const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  items: [{
    name: String,
    quantity: String,
    category: String,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    }
  }],
  progress: {
    type: Number,
    default: 0
  },
  completedItemsCount: {
    type: Number,
    default: 0
  },
  totalItemsCount: {
    type: Number,
    default: 0
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Pre-save middleware to update progress
listSchema.pre('save', function(next) {
  const completedCount = this.items.filter(item => item.isCompleted).length;
  const totalCount = this.items.length;
  
  this.completedItemsCount = completedCount;
  this.totalItemsCount = totalCount;
  this.progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  next();
});

// Method to mark item as done
listSchema.methods.markItemAsDone = async function(itemId) {
  const item = this.items.id(itemId);
  if (item) {
    item.isCompleted = true;
    item.completedAt = new Date();
    await this.save();
  }
  return this;
};

// Method to get progress
listSchema.methods.getProgress = function() {
  return {
    completed: this.completedItemsCount,
    total: this.totalItemsCount,
    display: `${this.completedItemsCount}/${this.totalItemsCount} done`,
    progress: this.progress
  };
};

module.exports = mongoose.model('List', listSchema);