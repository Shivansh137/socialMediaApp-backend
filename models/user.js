const { mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        min: 2,
        max: 20
    },
    name: {
        type: String,
        required: true,
        min: 2,
        max: 20
    },
    password: {
        type: String,
        required: true,
    },
    refreshTokens: [
        {
            type: String
        }
    ],
    profilePic: {
        type: String
    },
    followers: [],
    following: [],
    notifications: [new mongoose.Schema({
        username: String,
        message: String,
        time: {
            type: Date,
            default: new Date().toISOString()
        }
    }, {
        _id: false
    })]
});

const User = new mongoose.model('User', userSchema);
module.exports = User;