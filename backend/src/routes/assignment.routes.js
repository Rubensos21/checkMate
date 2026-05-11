const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.use(authMiddleware);

router.get('/courses/:courseId/assignments', assignmentController.listAssignments);
router.post('/courses/:courseId/assignments', roleMiddleware(['ADMIN', 'TEACHER']), assignmentController.createAssignment);
router.delete('/assignments/:id', roleMiddleware(['ADMIN', 'TEACHER']), assignmentController.deleteAssignment);

module.exports = router;
