const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  toilet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Toilet',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issue_text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  issue_type: {
    type: String,
    enum: ['cleanliness', 'maintenance', 'accessibility', 'safety', 'hours', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  resolved_at: {
    type: Date
  },
  resolved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  admin_notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for UUID compatibility
reportSchema.virtual('uuid').get(function() {
  return this._id.toString();
});

// Create indexes
reportSchema.index({ toilet_id: 1 });
reportSchema.index({ user_id: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ created_at: -1 });

module.exports = mongoose.model('Report', reportSchema);