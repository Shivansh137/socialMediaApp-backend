//EXPRESS
const express = require('express')
const app = express();
//DOTENV
require('dotenv').config();
//DATABASE
require('./config/dbConnection');
//CORS
const cors = require('cors');
const corsOptions = require('./config/corsOptions')
app.use(cors(corsOptions));
//COOKIE-PARSER
const cookieParser = require('cookie-parser');
app.use(cookieParser());
//middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}))
//CLOUDINARY
require('./config/cloudinary.config');
//ROUTES
app.use('/', require('./routes/root'));
app.use('/users', require('./routes/userRoute'));
app.use('/auth', require('./routes/authRoute'));
app.use('/chats', require('./routes/chatRoute'));
app.use('/stories', require('./routes/storyRoute'));
app.use('/posts', require('./routes/postRoute'));

app.use('*',(req,res)=>{
    res.status(404).json({message:"Not found"});
})
//SERVER
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`listening to port ${PORT}`);
});

const socket = require('socket.io');

const io = socket(server, {
    cors:{
        origin:process.env.host || "http://localhost:5173",
        credentials:true
    }
});

global.onlineUsers = new Map();

io.on("connection",(socket)=>{
    socket.on('user-joined', (username)=>{

        onlineUsers.set(username, socket.id);
        io.emit("userJoined", Array.from(onlineUsers.keys()));
    });

    socket.on('disconnect', () =>{
        let keyToDelete = '';
        for(let [key, value] of onlineUsers.entries()){
            if(value === socket.id) keyToDelete = key;
        }
        onlineUsers.delete(keyToDelete);
        io.emit("userJoined", Array.from(onlineUsers.keys()));
    });

    socket.on('send-msg', (data)=>{
        const reciever = onlineUsers.get(data?.reciever);
        if(reciever) socket.to(reciever).emit("recieve-msg", data?.message);
    });

    socket.on('sendTypingStatus', (username)=>{
        const reciever = onlineUsers.get(username);
        if(reciever) socket.to(reciever).emit("recieveTypingStatus", true);
    });

    socket.on('follow', (myUsername, username)=>{
        socket.to(onlineUsers.get(username)).emit("notification", myUsername, 'started following you');
    });
    
    socket.on('like', (myUsername, username)=>{
        socket.to(onlineUsers.get(username)).emit("notification", myUsername, 'liked your post');
    });
});

