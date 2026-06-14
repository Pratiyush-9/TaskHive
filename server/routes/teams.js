const express = require('express');
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeamById,
  addMember,
  updateMemberCapacity,
  removeMember
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

// All team routes are protected (need login)
router.use(protect);

router.route('/')
  .get(getTeams)
  .post(createTeam);

router.route('/:id')
  .get(getTeamById);

router.route('/:id/members')
  .post(addMember);

router.route('/:id/members/capacity')
  .put(updateMemberCapacity);

router.route('/:id/members/remove')
  .put(removeMember);

module.exports = router;