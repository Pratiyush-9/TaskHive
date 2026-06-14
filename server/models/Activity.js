const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  team: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Team', 
    required: true 
  },
  action: { 
    type: String, 
    required: true 
  },
  task: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  },
  fromUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  toUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);