const mongoose = require('mongoose');

const toiletSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Public', 'Shopping Mall', 'Railway Station', 'Airport', 'Restaurant', 'Hotel', 'Hospital', 'Park', 'Other'],
    default: 'Public'
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  },
  postal_code: {
    type: String,
    trim: true
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0,
    min: 0
  },
  image_url: {
    type: String,
    trim: true
  },
  working_hours: {
    type: String,
    default: '24 Hours'
  },
  business_status: {
    type: String,
    enum: ['OPERATIONAL', 'CLOSED_TEMPORARILY', 'CLOSED_PERMANENTLY'],
    default: 'OPERATIONAL'
  },
  is_paid: {
    type: String,
    enum: ['Yes', 'No', 'Free', 'Paid'],
    default: 'No'
  },
  wheelchair: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Unisex', 'Separate'],
    default: 'Unisex'
  },
  baby: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  shower: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  westernorindian: {
    type: String,
    enum: ['Western', 'Indian', 'Both'],
    default: 'Both'
  },
  napkin_vendor: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  verified: {
    type: Boolean,
    default: false
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index for location-based queries
toiletSchema.index({ latitude: 1, longitude: 1 });
toiletSchema.index({ city: 1 });
toiletSchema.index({ rating: -1 });
toiletSchema.index({ created_at: -1 });

// Virtual for UUID compatibility (to match existing frontend)
toiletSchema.virtual('uuid').get(function() {
  return this._id.toString();
});

// Method to calculate distance from a point
toiletSchema.methods.getDistanceFrom = function(lat, lng) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat - this.latitude) * Math.PI / 180;
  const dLng = (lng - this.longitude) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Static method to find nearby toilets
toiletSchema.statics.findNearby = function(lat, lng, maxDistance = 10, limit = 50) {
  return this.aggregate([
    {
      $addFields: {
        distance: {
          $multiply: [
            6371, // Earth's radius in km
            {
              $acos: {
                $add: [
                  {
                    $multiply: [
                      { $sin: { $multiply: [{ $degreesToRadians: "$latitude" }, 1] } },
                      { $sin: { $multiply: [{ $degreesToRadians: lat }, 1] } }
                    ]
                  },
                  {
                    $multiply: [
                      { $cos: { $multiply: [{ $degreesToRadians: "$latitude" }, 1] } },
                      { $cos: { $multiply: [{ $degreesToRadians: lat }, 1] } },
                      { $cos: { $multiply: [{ $degreesToRadians: { $subtract: ["$longitude", lng] } }, 1] } }
                    ]
                  }
                ]
              }
            }
          ]
        }
      }
    },
    {
      $match: {
        distance: { $lte: maxDistance }
      }
    },
    {
      $sort: { distance: 1 }
    },
    {
      $limit: limit
    }
  ]);
};

module.exports = mongoose.model('Toilet', toiletSchema);