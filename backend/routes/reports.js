const express = require('express');
const Report = require('../models/Report');
const Toilet = require('../models/Toilet');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Create a new report
router.post('/', auth, async (req, res) => {
  try {
    const { toilet_id, issue_text, issue_type } = req.body;
    
    // Check if toilet exists
    const toilet = await Toilet.findById(toilet_id);
    if (!toilet) {
      return res.status(404).json({
        success: false,
        message: 'Toilet not found'
      });
    }
    
    // Create report
    const report = new Report({
      toilet_id,
      user_id: req.user.id,
      issue_text,
      issue_type: issue_type || 'other'
    });
    
    await report.save();
    
    res.status(201).json({
      success: true,
      data: report,
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to submit report',
      error: error.message
    });
  }
});

// Get reports for a toilet (admin only)
router.get('/toilet/:toiletId', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view reports'
      });
    }
    
    const reports = await Report.find({ toilet_id: req.params.toiletId })
      .sort({ created_at: -1 })
      .populate('user_id', 'name');
    
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
});

// Get reports by a user
router.get('/user', auth, async (req, res) => {
  try {
    const reports = await Report.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .populate('toilet_id', 'name address');
    
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user reports'
    });
  }
});

// Update report status (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update reports'
      });
    }
    
    const { status, priority, admin_notes } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (admin_notes) updateData.admin_notes = admin_notes;
    
    // If status is resolved, add resolved info
    if (status === 'resolved') {
      updateData.resolved_at = new Date();
      updateData.resolved_by = req.user.id;
    }
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      data: report,
      message: 'Report updated successfully'
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update report',
      error: error.message
    });
  }
});

module.exports = router;