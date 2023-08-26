const router = require('express').Router();
const storyController = require('../controllers/storyController');
const upload = require('../middlewares/multer');

router.post('/', upload.single('file'), storyController.addStory)
router.get('/mystories/:username', storyController.getUserStoriesByUsername);
router.get('/:username', storyController.getAllStories);
router.delete('/:storyId',storyController.deleteStoryById)

module.exports = router;