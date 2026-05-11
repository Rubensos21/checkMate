const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submission.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.use(authMiddleware);

router.get('/', submissionController.getAllSubmissions);
router.get('/stats', roleMiddleware(['ADMIN', 'TEACHER']), submissionController.getStats);
router.post('/', roleMiddleware(['STUDENT']), submissionController.createSubmission);
router.put('/:id/grade', roleMiddleware(['ADMIN', 'TEACHER']), submissionController.gradeSubmission);
router.get('/:id/status', submissionController.getSubmissionStatus);
router.post('/upload', roleMiddleware(['STUDENT']), submissionController.uploadSubmissionWithOCR);

module.exports = router;
