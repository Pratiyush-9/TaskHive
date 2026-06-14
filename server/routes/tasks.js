const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByTeam,
  getTasksByProject,
  updateTask,
  deleteTask,
  autoReassign
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .post(createTask);

router.route('/team/:teamId')
  .get(getTasksByTeam);

router.route('/project/:projectId')
  .get(getTasksByProject);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.route('/reassign/:teamId')
  .post(autoReassign);

module.exports = router;