const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.use(authMiddleware);

router.get('/', settingsController.getSettings);
router.put('/', roleMiddleware(['ADMIN']), settingsController.updateSettings);

module.exports = router;
