const express = require('express');
const router = express.Router();
const evidenceController = require('../controllers/evidence.controller');

router.get('/evidences', evidenceController.getAllEvidences);
router.get('/stats', evidenceController.getStats);
router.put('/evidences/:id', evidenceController.updateStatus);

module.exports = router;
