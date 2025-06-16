const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  review_text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review_images: [{
    type: String,
    trim: true
  }],
  helpful_count: {
    type: Number,
    default: 0,
    min: 0
  },
  reported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for UUID compatibility
reviewSchema.virtual('uuid').get(function() {
  return this._id.toString();
});

// Create indexes
reviewSchema.index({ toilet_id: 1 });
reviewSchema.index({ user_id: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ created_at: -1 });

// Update toilet rating when review is saved
reviewSchema.post('save', async function() {
  const Toilet = mongoose.model('Toilet');
  
  try {
    const stats = await mongoose.model('Review').aggregate([
      { $match: { toilet_id: this.toilet_id } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await Toilet.findByIdAndUpdate(this.toilet_id, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviews: stats[0].totalReviews
      });
    }
  } catch (error) {
    console.error('Error updating toilet rating:', error);
  }
});

// Update toilet rating when review is deleted
reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Toilet = mongoose.model('Toilet');
    
    try {
      const stats = await mongoose.model('Review').aggregate([
        { $match: { toilet_id: doc.toilet_id } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);

      const updateData = stats.length > 0 
        ? {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviews: stats[0].totalReviews
          }
        : {
            rating: 0,
            reviews: 0
          };

      await Toilet.findByIdAndUpdate(doc.toilet_id, updateData);
    } catch (error) {
      console.error('Error updating toilet rating after deletion:', error);
    }
  }
});

module.exports = mongoose.model('Review', reviewSchema);