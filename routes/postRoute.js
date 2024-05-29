const router = require('express').Router();
const postController = require('../controllers/postController');
const upload = require('../middlewares/multer')

router.route('/')
    .post(upload.array('postFiles'), postController.addPost)

router.delete('/:id', postController.deletePost)

router.get('/:username', postController.getAllPostsByUsername);
router.get('/myposts/:username', postController.getUserPostsByUsername);

router.patch('/like/:id', postController.handleLike);

router.post('/comments/:id', postController.addComment);
router.get('/comments/:id', postController.getAllComments);

module.exports = router;