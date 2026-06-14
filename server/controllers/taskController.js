const Task = require('../models/Task');
const Team = require('../models/Team');
const Activity = require('../models/Activity');

// CREATE TASK
const createTask = async (req, res) => {
  try {
    const { title, description, project, team, assignedTo, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      project,
      team,
      assignedTo,
      priority,
      createdBy: req.user._id
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .populate('team', 'name');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL TASKS FOR A TEAM
const getTasksByTeam = async (req, res) => {
  try {
    const tasks = await Task.find({ team: req.params.teamId })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET TASKS BY PROJECT
const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE TASK
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email')
      .populate('project', 'name');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE TASK
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ⚖️ AUTO REASSIGN ALGORITHM (CORE FEATURE)
const autoReassign = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Step 1: Get the team with all members and their capacities
    const team = await Team.findById(teamId)
      .populate('members.user', 'name email');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Step 2: Get all active tasks for this team
    const tasks = await Task.find({ 
      team: teamId, 
      status: { $ne: 'completed' } 
    });

    // Step 3: Count tasks per member
    const memberTaskCount = {};
    team.members.forEach(member => {
      memberTaskCount[member.user._id.toString()] = 0;
    });

    tasks.forEach(task => {
      if (task.assignedTo) {
        const userId = task.assignedTo.toString();
        if (memberTaskCount[userId] !== undefined) {
          memberTaskCount[userId]++;
        }
      }
    });

    // Step 4: Find overloaded and available members
    const overloaded = [];
    const available = [];

    team.members.forEach(member => {
      const userId = member.user._id.toString();
      const taskCount = memberTaskCount[userId] || 0;
      const capacity = member.capacity;

      if (taskCount > capacity) {
        overloaded.push({ 
          user: member.user, 
          taskCount, 
          capacity,
          excess: taskCount - capacity 
        });
      } else if (taskCount < capacity) {
        available.push({ 
          user: member.user, 
          taskCount, 
          capacity,
          freeSlots: capacity - taskCount 
        });
      }
    });

    // Step 5: Reassign tasks
    const reassignments = [];

    for (const overloadedMember of overloaded) {
      // Get only LOW and MEDIUM priority tasks (never move HIGH)
      const movableTasks = tasks.filter(task =>
        task.assignedTo &&
        task.assignedTo.toString() === overloadedMember.user._id.toString() &&
        task.priority !== 'high' &&
        task.status !== 'completed'
      );

      for (const task of movableTasks) {
        if (available.length === 0) break;

        // Find member with most free slots
        available.sort((a, b) => b.freeSlots - a.freeSlots);
        const targetMember = available[0];

        if (targetMember.freeSlots <= 0) break;

        // Reassign the task
        await Task.findByIdAndUpdate(task._id, { 
          assignedTo: targetMember.user._id 
        });

        // Log the activity
        await Activity.create({
          team: teamId,
          action: `Task "${task.title}" reassigned from ${overloadedMember.user.name} to ${targetMember.user.name}`,
          task: task._id,
          fromUser: overloadedMember.user._id,
          toUser: targetMember.user._id,
          performedBy: req.user._id
        });

        reassignments.push({
          task: task.title,
          from: overloadedMember.user.name,
          to: targetMember.user.name
        });

        // Update free slots
        targetMember.freeSlots--;
        targetMember.taskCount++;

        if (targetMember.freeSlots === 0) {
          available.shift();
        }
      }
    }

    res.json({ 
      message: `Rebalanced ${reassignments.length} tasks`,
      reassignments 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  createTask, 
  getTasksByTeam, 
  getTasksByProject,
  updateTask, 
  deleteTask, 
  autoReassign 
};