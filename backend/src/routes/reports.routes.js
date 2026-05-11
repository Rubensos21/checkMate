const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protect these routes
router.use(authMiddleware);

router.get('/system', reportsController.getSystemReports);
router.get('/student/:studentId', reportsController.getStudentProgress);

module.exports = router;
