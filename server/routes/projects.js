const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjectsByTeam,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(createProject);

router.route('/team/:teamId')
  .get(getProjectsByTeam);

router.route('/:id')
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

module.exports = router;