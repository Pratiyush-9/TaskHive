const Team = require('../models/Team');
const User = require('../models/User');
const { sendMemberAddedEmail } = require('../utils/emailService');

// CREATE TEAM
const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await Team.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin', capacity: 5 }]
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email avatar');

    res.status(201).json(populatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL MY TEAMS
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
      .populate('owner', 'name email')
      .populate('members.user', 'name email avatar');

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE TEAM
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email avatar');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD MEMBER TO TEAM
const addMember = async (req, res) => {
  try {
    const { userId, role, capacity } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if already a member
    const alreadyMember = team.members.find(
      m => m.user.toString() === userId
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'User already in team' });
    }

    const user = await User.findById(userId).select('name email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    team.members.push({ user: userId, role: role || 'member', capacity: capacity || 5 });
    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email avatar');

    try {
      await sendMemberAddedEmail({
        to: user.email,
        recipientName: user.name,
        teamName: team.name,
        addedBy: req.user?.name || req.user?.email,
      });
    } catch (mailError) {
      console.error('Member-added email failed:', mailError.message);
    }

    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE MEMBER CAPACITY
const updateMemberCapacity = async (req, res) => {
  try {
    const { userId, capacity } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const member = team.members.find(
      m => m.user.toString() === userId
    );
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.capacity = capacity;
    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email avatar');

    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REMOVE MEMBER
const removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    team.members = team.members.filter(
      m => m.user.toString() !== userId
    );
    await team.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  addMember,
  updateMemberCapacity,
  removeMember
};