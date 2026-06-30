const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/teams');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const activityRoutes = require('./routes/activity');

const app = express();

app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activity', activityRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'TaskHive API is running 🐝' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });