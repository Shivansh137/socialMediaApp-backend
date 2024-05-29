const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
    public_id: String,
    file_type: String
}, {
    _id: false
});

const storySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    media: mediaSchema,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400
    }
}, {
    expireAfterSeconds: 86400,
    expires: true
});

const Story = new mongoose.model("Story", storySchema);
module.exports = Story;