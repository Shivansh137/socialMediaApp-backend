const Story = require("../models/story");
const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const getDataUri = require("../utils/getDataUri");
const cloudinary = require('cloudinary');

const addStory = asyncHandler(async (req, res) => {
    const { username } = req.body;
    const file = req.file;
    if (!username || !file) return res.status(409).json({ message: 'All field are required' });
    //PROCESSING FILE
    const datauri = getDataUri(file);
    const type = file.mimetype?.split('/')[0];
    const imageData = await cloudinary.v2.uploader.upload(datauri, { resource_type: type, folder: 'socialMediaApp/stories' });
    const story = await Story.create({username, media:{ public_id: imageData?.public_id, file_type: type }})
    return res.json(story);
})

const getAllStories = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username }).lean().exec();
    if (!user) return res.status(404).json({ message: "User not found" });
    const stories = await Story.find({ username: { $in: [...user.following] } }).lean();
    const usernamesRepeated = stories.map(story => story.username);
    const usersnameSet = new Set(usernamesRepeated);
    const usernames = [...usersnameSet];
    const data = {};
    usernames.forEach((username) => {
        data[username] = stories.filter(story => story.username === username);
    })
    res.json(data);
})

const getUserStoriesByUsername = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const stories = await Story.find({ username }).lean();
    res.send(stories);
});

const deleteStoryById = asyncHandler(async (req, res) => {
    const { storyId } = req.params;
    const response = await Story.deleteOne({ _id: storyId }).exec();
    if (!response?.deletedCount) return res.status(404).json({ message: 'No story found' })
    res.send('Story deleted')
})

module.exports = { addStory, getUserStoriesByUsername, getAllStories, deleteStoryById };