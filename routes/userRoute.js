const router = require('express').Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/multer')
const verifyJWT = require('../middlewares/verifyJWT')

router.route('/')
    .get(userController.getAllUsers)
    .post(upload.single('profilePic'), userController.addUser)

router.patch('/change_password', userController.changePassword);

router.patch('/follow', userController.toggleFollow);

router.get('/followers/:username', userController.getFollowersData);
router.get('/following/:username', userController.getFollowingData);
router.get('/profilePic/:username', userController.getProfilePicByUsername);

router.route('/:username')
    .patch(verifyJWT, upload.single('profilePic'), userController.updateUser)
    .delete(verifyJWT, userController.deleteUser)

router.get('/:username', userController.getUserByUsername);

router.get('/search/:reg', userController.searchUser);

router.post('/notifications/:username', userController.addNotification);
router.get('/notifications/:username', userController.getAllNotifications);
router.delete('/notifications/:username', userController.clearNotifications);

module.exports = router;