const express = require('express');
const Toilet = require('../models/Toilet');
const { auth, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Get all toilets with optional location-based sorting
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, limit = 50, page = 1, search, rating, type, features } = req.query;
    
    let query = { business_status: 'OPERATIONAL' };
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by rating
    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }
    
    // Filter by type
    if (type) {
      query.type = type;
    }
    
    // Filter by features
    if (features) {
      const featureArray = features.split(',');
      featureArray.forEach(feature => {
        switch (feature) {
          case 'wheelchair':
            query.wheelchair = 'Yes';
            break;
          case 'baby':
            query.baby = 'Yes';
            break;
          case 'shower':
            query.shower = 'Yes';
            break;
          case 'free':
            query.is_paid = { $in: ['No', 'Free'] };
            break;
        }
      });
    }
    
    let toilets;
    
    // If location provided, use geospatial query
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      
      toilets = await Toilet.aggregate([
        { $match: query },
        {
          $addFields: {
            distance: {
              $multiply: [
                6371,
                {
                  $acos: {
                    $add: [
                      {
                        $multiply: [
                          { $sin: { $multiply: [{ $degreesToRadians: "$latitude" }, 1] } },
                          { $sin: { $multiply: [{ $degreesToRadians: latitude }, 1] } }
                        ]
                      },
                      {
                        $multiply: [
                          { $cos: { $multiply: [{ $degreesToRadians: "$latitude" }, 1] } },
                          { $cos: { $multiply: [{ $degreesToRadians: latitude }, 1] } },
                          { $cos: { $multiply: [{ $degreesToRadians: { $subtract: ["$longitude", longitude] } }, 1] } }
                        ]
                      }
                    ]
                  }
                }
              ]
            }
          }
        },
        { $sort: { distance: 1, rating: -1 } },
        { $skip: (page - 1) * parseInt(limit) },
        { $limit: parseInt(limit) }
      ]);
    } else {
      // Regular query without location
      toilets = await Toilet.find(query)
        .sort({ rating: -1, created_at: -1 })
        .skip((page - 1) * parseInt(limit))
        .limit(parseInt(limit));
    }
    
    res.json({
      success: true,
      data: toilets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Toilet.countDocuments(query)
      }
    });
  } catch (error) {
    console.error('Error fetching toilets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch toilets'
    });
  }
});

// Get nearby toilets
router.get('/nearby', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, radius = 10, limit = 25 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    const toilets = await Toilet.findNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius),
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: toilets
    });
  } catch (error) {
    console.error('Error fetching nearby toilets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby toilets'
    });
  }
});

// Get top rated toilets
router.get('/top-rated', optionalAuth, async (req, res) => {
  try {
    const { limit = 10, lat, lng } = req.query;
    
    let toilets;
    
    if (lat && lng) {
      toilets = await Toilet.aggregate([
        { $match: { business_status: 'OPERATIONAL', rating: { $gte: 4.0 } } },
        {
          $addFields: {
            distance: {
              $multiply: [
                6371,
                {
                  $acos: {
                    $add: [
                      {
                        $multiply: [
                          { $sin: { $multiply: [{ $degreesToRadians: "$latitude" }, 1] } },
                          { $sin: { $multiply: [{ $degreesToRadians: parseFloat(lat) }, 1] } }
                        ]
                      },
                      {
                        $multiply: [
                          { $cos: { $multiply: [{ $degreesToRadians: "$latitude" }, 1] } },
                          { $cos: { $multiply: [{ $degreesToRadians: parseFloat(lat) }, 1] } },
                          { $cos: { $multiply: [{ $degreesToRadians: { $subtract: ["$longitude", parseFloat(lng)] } }, 1] } }
                        ]
                      }
                    ]
                  }
                }
              ]
            }
          }
        },
        { $sort: { rating: -1, reviews: -1, distance: 1 } },
        { $limit: parseInt(limit) }
      ]);
    } else {
      toilets = await Toilet.find({
        business_status: 'OPERATIONAL',
        rating: { $gte: 4.0 }
      })
      .sort({ rating: -1, reviews: -1 })
      .limit(parseInt(limit));
    }
    
    res.json({
      success: true,
      data: toilets
    });
  } catch (error) {
    console.error('Error fetching top rated toilets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top rated toilets'
    });
  }
});

// Get open toilets
router.get('/open', optionalAuth, async (req, res) => {
  try {
    const { limit = 20, lat, lng } = req.query;
    
    // Simple implementation - in production you'd want more sophisticated hour checking
    const query = {
      business_status: 'OPERATIONAL',
      $or: [
        { working_hours: { $regex: '24', $options: 'i' } },
        { working_hours: { $regex: 'always', $options: 'i' } },
        { working_hours: { $exists: false } }
      ]
    };
    
    let toilets;
    
    if (lat && lng) {
      toilets = await Toilet.aggregate([
        { $match: query },
        {
          $addFields: {
            distance: {
              $multiply: [
                6371,
                {
                  $acos: {
                    $add: [
                      {
                        $multiply: [
                          { $sin: { $multiply: [{ $degreesToRadians: "$latitude" }, 1] } },
                          { $sin: { $multiply: [{ $degreesToRadians: parseFloat(lat) }, 1] } }
                        ]
                      },
                      {
                        $multiply: [
                          { $cos: { $multiply: [{ $degreesToRadians: "$latitude" }, 1] } },
                          { $cos: { $multiply: [{ $degreesToRadians: parseFloat(lat) }, 1] } },
                          { $cos: { $multiply: [{ $degreesToRadians: { $subtract: ["$longitude", parseFloat(lng)] } }, 1] } }
                        ]
                      }
                    ]
                  }
                }
              ]
            }
          }
        },
        { $sort: { distance: 1, rating: -1 } },
        { $limit: parseInt(limit) }
      ]);
    } else {
      toilets = await Toilet.find(query)
        .sort({ rating: -1, created_at: -1 })
        .limit(parseInt(limit));
    }
    
    res.json({
      success: true,
      data: toilets
    });
  } catch (error) {
    console.error('Error fetching open toilets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch open toilets'
    });
  }
});

// Get single toilet by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const toilet = await Toilet.findById(req.params.id);
    
    if (!toilet) {
      return res.status(404).json({
        success: false,
        message: 'Toilet not found'
      });
    }
    
    res.json({
      success: true,
      data: toilet
    });
  } catch (error) {
    console.error('Error fetching toilet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch toilet'
    });
  }
});

// Create new toilet (authenticated users only)
router.post('/', auth, async (req, res) => {
  try {
    const toiletData = {
      ...req.body,
      created_by: req.user.id
    };
    
    const toilet = new Toilet(toiletData);
    await toilet.save();
    
    res.status(201).json({
      success: true,
      data: toilet,
      message: 'Toilet created successfully'
    });
  } catch (error) {
    console.error('Error creating toilet:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create toilet',
      error: error.message
    });
  }
});

// Update toilet (authenticated users only)
router.put('/:id', auth, async (req, res) => {
  try {
    const toilet = await Toilet.findById(req.params.id);
    
    if (!toilet) {
      return res.status(404).json({
        success: false,
        message: 'Toilet not found'
      });
    }
    
    // Check if user owns the toilet or is admin
    if (toilet.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this toilet'
      });
    }
    
    const updatedToilet = await Toilet.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: updatedToilet,
      message: 'Toilet updated successfully'
    });
  } catch (error) {
    console.error('Error updating toilet:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update toilet',
      error: error.message
    });
  }
});

// Delete toilet (authenticated users only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const toilet = await Toilet.findById(req.params.id);
    
    if (!toilet) {
      return res.status(404).json({
        success: false,
        message: 'Toilet not found'
      });
    }
    
    // Check if user owns the toilet or is admin
    if (toilet.created_by.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this toilet'
      });
    }
    
    await toilet.deleteOne();
    
    res.json({
      success: true,
      message: 'Toilet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting toilet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete toilet'
    });
  }
});

module.exports = router;