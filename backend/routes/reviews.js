const express = require('express');
const Review = require('../models/Review');
const Toilet = require('../models/Toilet');
const { auth, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Get all reviews for a toilet
router.get('/toilet/:toiletId', optionalAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ toilet_id: req.params.toiletId })
      .sort({ created_at: -1 })
      .populate('user_id', 'name avatar_url');
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    });
  }
});

// Get reviews by a user
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const reviews = await Review.find({ user_id: req.params.userId })
      .sort({ created_at: -1 })
      .populate('toilet_id', 'name address city');
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reviews'
    });
  }
});

// Create a new review
router.post('/', auth, async (req, res) => {
  try {
    const { toilet_id, rating, review_text, review_images } = req.body;
    
    // Check if toilet exists
    const toilet = await Toilet.findById(toilet_id);
    if (!toilet) {
      return res.status(404).json({
        success: false,
        message: 'Toilet not found'
      });
    }
    
    // Check if user already reviewed this toilet
    const existingReview = await Review.findOne({
      toilet_id,
      user_id: req.user.id
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this toilet'
      });
    }
    
    // Create new review
    const review = new Review({
      toilet_id,
      user_id: req.user.id,
      rating,
      review_text,
      review_images: review_images || []
    });
    
    await review.save();
    
    res.status(201).json({
      success: true,
      data: review,
      message: 'Review created successfully'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create review',
      error: error.message
    });
  }
});

// Update a review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user owns the review
    if (review.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }
    
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update review',
      error: error.message
    });
  }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user owns the review
    if (review.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }
    
    await Review.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review'
    });
  }
});

// Mark review as helpful
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Increment helpful count
    review.helpful_count += 1;
    await review.save();
    
    res.json({
      success: true,
      data: review,
      message: 'Review marked as helpful'
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful'
    });
  }
});

module.exports = router;