const { default: mongoose } = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const getDataUri = require('../utils/getDataUri');
const cloudinary = require('cloudinary');

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  if (JSON.stringify(users) === "[]") return res.status(203).json({ message: "No user found" });
  res.json(Array.isArray(users) ? users : [users]);
});

//CREATE USER
const addUser = asyncHandler(async (req, res) => {
  const { username, name, password } = req.body;
  if (!username || !name || !password) return res.status(409).json({ message: "All fields are required" });
  const duplicate = await User.findOne({ username }).lean().exec();
  if (duplicate) return res.status(409).json({ message: "username already exists" });
  const hashed_password = await bcrypt.hash(password, 10);
  const user = new User();
  user.username = username;
  user.name = name;
  user.password = hashed_password;
  let profilePic = '';
  if (req.file) {
    const datauri = getDataUri(req.file);
    const imageData = await cloudinary.v2.uploader.upload(datauri, { folder: 'socialMediaApp' });
    user.profilePic = imageData.public_id;
    profilePic = imageData.public_id;
  }
  await user.save();
  const accessToken = jwt.sign({ username, name, profilePic }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })
  const refreshToken = jwt.sign({ username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
  res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
  res.json({ accessToken });
})

// GET USER BY ID
const getUserByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return res.status(409).json({ message: "username is required" });
  const user = await User.findOne({ username }).lean().exec();
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});


const getProfilePicByUsername = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return res.status(409).json({ message: "username is required" });
  const response = await User.findOne({ username }, { _id: 0, profilePic: 1 }).lean().exec();
  res.json(response?.profilePic);
});



// @UPDATE USER
const updateUser = asyncHandler(async (req, res) => {
  const { username, name } = req.body;
  if (!username) return response(409, "username is required");
  const user = await User.findOne({ username }).exec();
  if (!user) return res.status(409).json({ message: "User not exists" });
  if (name && name !== user.name) user.name = name;
 
  if (req.file) {
    const datauri = getDataUri(req.file);
    const imageData = await cloudinary.v2.uploader.upload(datauri, { folder: 'socialMediaApp' });
    user.profilePic = imageData.public_id;
  }
  const userUpdated = await user.save();
  if (!userUpdated) return res.status(403).json({ message: "Cannot update user" });
  res.json({ message: "Updated Successfully" });
})

// Change password
 const changePassword  = asyncHandler( async (req,res) => {
  const {c_password, n_password, username} = req.body;
  if (!username) return response(409, "username is required");
  const user = await User.findOne({ username }).exec();
  if (!user) return res.status(409).json({ message: "User not exists" });
    const isCorrectPassword = await bcrypt.compare(c_password, user.password);
    if(!isCorrectPassword) return res.status(409).json({message:'Incorrect password'});
   const hashed_password = await bcrypt.hash(n_password, 10);
   user.password = hashed_password;
   await user.save();
   res.json({message:'Password Changed'});
 })
//DELETE USER
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(409).json({ message: "id is required" });
  if (!mongoose.isValidObjectId(id)) return res.status(409).json({ message: "invalid user id" });
  const response = await User.deleteOne({ _id: id });
  if (response?.deletedCount === 0) return res.status(409).json({ message: "User not found" });
  res.status(202).json({ message: "User Deleted" });
})

//FOLLOW REQUEST
const toggleFollow = asyncHandler(async (req, res) => {
  const { followerUsername, followingUsername } = req.body;
  const following = await User.findOne({ username: followingUsername }).exec();
  if (!following) return res.status(409).json({ message: "User not found" });
  const follower = await User.findOne({ username: followerUsername }).exec();
  if (!follower) return res.status(409).json({ message: "User not found" });

  if (follower?.following?.includes(following?.username)) {
    const index1 = follower?.following?.indexOf(following?.username);
    const index2 = following?.followers?.indexOf(follower?.username);
    follower?.following?.splice(index1, 1);
    following?.followers?.splice(index2, 1);
    await follower.save();
    await following.save();
    res.json({ message: "Unfollow successfull" });
  }
  else {
    follower?.following?.push(following?.username);
    following?.followers?.push(follower?.username);
    await follower.save();
    await following.save();
    res.json({ message: "Follow successfull" });
  }
});

const getFollowersData = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username }).lean().exec();
  if (!user) return res.status(409).json({ message: "User not exists" });
  const data = await User.find({ username: { $in: user?.followers } }, { username: 1, name: 1, profilePic: 1, _id: 0 });
  res.json(data);
})
const getFollowingData = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username }).lean().exec();
  const data = await User.find({ username: { $in: user?.following } }, { username: 1, name: 1, profilePic: 1, _id: 0 });
  res.json(data);
})

//Search for user
const searchUser = asyncHandler(async (req, res) => {
  const { reg } = req.params;
  const nameResult = await User.find().regex("name || username", new RegExp(reg, 'i'));
  const usernameResult = await User.find().regex("username", new RegExp(reg, 'i'));
  const searchResult = new Set(nameResult?.concat(usernameResult));
  res.send([...searchResult]);
})

const addNotification = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { username2 ,message } = req.body;
  const user = await User.findOne({ username }).exec();
  if (!user) return res.status(409).json({ message: "User not exists" });
  user?.notifications.push({ username:username2, message });
  await user.save();
  res.json({message:'Notification added'})
})
const getAllNotifications = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username }, {_id:0, notifications:1}).lean().exec();
  if (!user) return res.status(409).json({ message: "User not exists" });
  res.json(user.notifications)
})
const clearNotifications = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username }).exec();
  if (!user) return res.status(409).json({ message: "User not exists" });
  user.notifications = [];
  await user.save();
  res.json({message:'Notifications cleared'});
})

module.exports = {
  getAllUsers,
  getUserByUsername,
  getProfilePicByUsername,
  addUser,
  updateUser,
  changePassword,
  deleteUser,
  toggleFollow,
  getFollowersData,
  getFollowingData,
  searchUser,
  addNotification,
  getAllNotifications,
  clearNotifications
};