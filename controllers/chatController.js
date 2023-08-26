const Message = require('../models/message');


const addMessage = async (req, res) => {
    const { sender, reciever, message, biggerText } = req.body;
    const newMessage = await Message.create({ sender, reciever, message, biggerText });
    res.json(newMessage);
}
const getAllMessages = async (req, res) => {
    const { username1, username2 } = req.body;
    const messages = await Message.find({ sender: { $in: [username1, username2] }, reciever: { $in: [username1, username2] } }).sort({ updatedAt: 1 });
    res.json(messages);
}
const getUnreadedMessages = async (req, res) => {
    const { username } = req.params;
    const messages = await Message.find({ reciever: username, isReaded: false }).sort({ updatedAt: 1 });
    res.json(messages);
}

const readUnreadMessages = async (req,res)=>{
    const {sender, reciever} = req.body;
    const response = await Message.updateMany({sender, reciever, isReaded:false}, {isReaded:true});
    res.json({message:response});
}

const getChatUsersList = async (req,res)=>{
    const {username} = req.params;
    const recievers = await Message.find({sender:username},{ reciever:1,_id:0}).lean();
    const senders = await Message.find({reciever:username},{ sender:1,_id:0}).lean();
    const usersSet = new Set(senders.map(e => e.sender).concat(recievers.map(e => e.reciever)));
    const usersArr =  [...usersSet];
    res.json(usersArr);
}

module.exports = { addMessage, getAllMessages, getUnreadedMessages, readUnreadMessages ,getChatUsersList};