const { default: mongoose } = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');
const asyncHandler = require('express-async-handler');
const getDataUri = require('../utils/getDataUri');
const cloudinary = require('cloudinary');

const getAllPostsByUsername = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(409).json({ message: "Username required" });
    const user = await User.findOne({ username }).lean().exec();
    const posts = await Post.find({ username: { $in: [...user?.following] } }).sort({ createdAt: -1 });
    if (!posts?.length) return res.json({ message: "No post found" });
    res.json(Array.isArray(posts) ? posts : [posts]);
});
const getUserPostsByUsername = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(409).json({ message: "Username required" });
    const posts = await Post.find({ username }).sort({ createdAt: 1 });
    res.json(Array.isArray(posts) ? posts : [posts]);
})
const getPostById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(409).json({ message: "Invalid post id" });
    const post = await Post.findById(id).lean().exec();
    res.json(post);
});

const addPost = asyncHandler(async (req, res) => {
    const { username, title, location, ratio } = req.body;
    const files = req.files;
    if (!username || !files?.length) return res.status(409).json({ message: 'All field are required' });
    const post = new Post();
    post.username = username;
    post.title = title;
    post.location = location;
    post.ratio = ratio;
    //PROCESSING FILES
    for (let i = 0; i < files.length; i++) {
        const datauri = getDataUri(files[i]);
        const type = files[i].mimetype?.split('/')[0]; // img or video
        const extension = files[i].mimetype?.split('/')[1]; // png, jpeg etc
        const imageData = await cloudinary.v2.uploader.upload(datauri, { resource_type: type, folder: 'socialMediaApp/stories' });
        post.media.push({
            public_id: imageData?.public_id,
            media_type: type,
            extension
        });
    }
    await post.save();
    return res.json({ message: 'Post Created' });
})

const updatePost = asyncHandler(async (req, res) => {

})
const deletePost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await Post.deleteOne({ _id: id });
    if (!response?.deletedCount) return res.status(404).json({ message: 'Post Not found' })
    res.json({ message: "Post deleted" });
})


const handleLike = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    if (!mongoose.isValidObjectId(id)) return res.status(409).json({ message: "Invalid post id" });
    const post = await Post.findById(id).exec();
    if (post?.likes?.includes(username)) post?.likes?.splice(post.likes.indexOf(username), 1);
    else post?.likes?.push(username);
    await post.save();
    res.status(200).json({ message: 'Success' });
})

const addComment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, message } = req.body;
    const post = await Post.findById(id).exec();
    post?.comments.push({username, message});
    await post?.save();
    res.json({message:'Success'});
});

const getAllComments = asyncHandler(async (req,res)=>{
    const {id} = req.params;
    const post = await Post.findById(id).lean().exec()
    const comments = post?.comments
    res.send(comments);
})

module.exports = {
    getAllPostsByUsername,
    getUserPostsByUsername,
    getPostById,
    addPost,
    updatePost,
    deletePost,
    handleLike,
    addComment,
    getAllComments
};