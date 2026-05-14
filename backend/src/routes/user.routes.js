const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const bulkUserController = require('../controllers/bulk-user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const multer = require('multer');

// Configure multer for file uploads (memory storage for Excel files)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Bulk upload routes
router.get('/bulk/template', bulkUserController.downloadTemplate);
router.post('/bulk/upload', upload.single('file'), bulkUserController.bulkUploadUsers);

// Ensure multer is only applied to upload routes
module.exports = router;

module.exports = router;
