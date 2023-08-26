const router = require('express').Router();
const chatController = require('../controllers/chatController');

router.post('/',chatController.addMessage)
router.post('/messages',chatController.getAllMessages)
router.get('/messages/unreaded/:username', chatController.getUnreadedMessages);
router.post('/messages/unreaded/', chatController.readUnreadMessages);
router.get('/users/:username', chatController.getChatUsersList);

module.exports = router;