const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.use(authMiddleware);

router.get('/courses', courseController.getAllCourses);
router.post('/courses', roleMiddleware(['ADMIN']), courseController.createCourse);
router.get('/courses/:id', courseController.getCourseById);
router.delete('/courses/:id', roleMiddleware(['ADMIN']), courseController.deleteCourse);
router.post('/courses/:courseId/enroll', roleMiddleware(['ADMIN']), courseController.enrollStudent);
router.delete('/courses/:courseId/enroll/:userId', roleMiddleware(['ADMIN']), courseController.unenrollStudent);
router.put('/courses/:courseId/teacher', roleMiddleware(['ADMIN']), courseController.assignTeacher);

module.exports = router;
