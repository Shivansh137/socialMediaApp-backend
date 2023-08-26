const router = require('express').Router();
const authController = require('../controllers/authControllers');

router.post('/login', authController.login);
router.get('/refresh', authController.refresh);
router.get('/logout', authController.logout);

module.exports = router;