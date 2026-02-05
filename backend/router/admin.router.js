const router = require('express').Router();
const adminController = require('../controller/admin.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.post('/login', adminController.login);
router.get('/me', authMiddleware, adminController.me);
router.post('/logout', authMiddleware, adminController.logout);

router.post('/skills', authMiddleware, adminController.addSkill);
router.put('/skills/:id', authMiddleware, adminController.updateSkill);
router.delete('/skills/:id', authMiddleware, adminController.deleteSkill);

router.post('/projects', authMiddleware, adminController.addProject);
router.put('/projects/:id', authMiddleware, adminController.updateProject);
router.delete('/projects/:id', authMiddleware, adminController.deleteProject);

router.get('/contacts', authMiddleware, adminController.getContactSubmissions);

module.exports = router;
