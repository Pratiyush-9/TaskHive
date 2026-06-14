const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Activity = require('../models/Activity');

router.use(protect);

// GET ACTIVITY LOG FOR A TEAM
router.get('/:teamId', async (req, res) => {
  try {
    const activities = await Activity.find({ team: req.params.teamId })
      .populate('fromUser', 'name')
      .populate('toUser', 'name')
      .populate('task', 'title')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;