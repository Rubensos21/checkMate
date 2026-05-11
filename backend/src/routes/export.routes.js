const express = require('express');
const router = express.Router();
const { exportExcel, getNotifications } = require('../controllers/export.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/excel', exportExcel);
router.get('/notifications', getNotifications);

module.exports = router;
