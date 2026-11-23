const router = require('express').Router();
const multer = require('multer');

const adminController = require('../controller/admin.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  loginSchema,
  skillSchema,
  projectSchema,
  profileSchema
} = require('../validators/schemas');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype === 'application/pdf') {
      return callback(null, true);
    }
    const error = new Error('Only PDF files are allowed');
    error.status = 400;
    return callback(error);
  }
});

router.post('/login', validate(loginSchema), adminController.login);
router.get('/me', authMiddleware, adminController.me);
router.post('/logout', authMiddleware, adminController.logout);

router.put('/profile', authMiddleware, validate(profileSchema), adminController.updateProfile);
router.post('/cv', authMiddleware, upload.single('cv'), adminController.uploadCv);

router.post('/skills', authMiddleware, validate(skillSchema), adminController.addSkill);
router.put('/skills/:id', authMiddleware, validate(skillSchema), adminController.updateSkill);
router.delete('/skills/:id', authMiddleware, adminController.deleteSkill);

router.post('/projects', authMiddleware, validate(projectSchema), adminController.addProject);
router.put('/projects/:id', authMiddleware, validate(projectSchema), adminController.updateProject);
router.delete('/projects/:id', authMiddleware, adminController.deleteProject);

router.get('/contacts', authMiddleware, adminController.getContactSubmissions);

module.exports = router;
