const Project = require('../models/Project');

// CREATE PROJECT
const createProject = async (req, res) => {
  try {
    const { name, description, team, dueDate } = req.body;

    const project = await Project.create({
      name,
      description,
      team,
      dueDate,
      owner: req.user._id
    });

    const populatedProject = await Project.findById(project._id)
      .populate('team', 'name')
      .populate('owner', 'name email');

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL PROJECTS FOR A TEAM
const getProjectsByTeam = async (req, res) => {
  try {
    const projects = await Project.find({ team: req.params.teamId })
      .populate('owner', 'name email')
      .populate('team', 'name')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE PROJECT
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('team', 'name');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PROJECT
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('owner', 'name email')
      .populate('team', 'name');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE PROJECT
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProject,
  getProjectsByTeam,
  getProjectById,
  updateProject,
  deleteProject
};