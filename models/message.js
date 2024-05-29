const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    reciever: {
        type: String,
        required: true
    },
    biggerText: {
        type: Boolean,
        default: false
    },
    isReaded: {
        type: Boolean,
        default: false
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const Message = new mongoose.model('message', messageSchema);
module.exports = Message;