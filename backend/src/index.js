const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const submissionRoutes = require('./routes/submission.routes');
const reportsRoutes = require('./routes/reports.routes');
const userRoutes = require('./routes/user.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const settingsRoutes = require('./routes/settings.routes');
const uploadRoutes = require('./routes/upload.routes');
const exportRoutes = require('./routes/export.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve uploaded files as static assets
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes — auth FIRST (no middleware), then protected
app.use('/api/auth', authRoutes);
app.use('/api', courseRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', userRoutes);
app.use('/api', assignmentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/export', exportRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'DCG Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
