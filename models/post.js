const { mongoose, SchemaTypes} = require("mongoose");

const postSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    title:{
        type:String,
        min:2,
        max:20
    },
    location:{
        type:String,
        min:2,
        max:20
    },
   
    ratio:{
        type:String,
        default:'1/1'
    },
    media:[
        new mongoose.Schema({
            public_id:String,
            media_type:String,
            extension:String
        },{
            _id:false
        })
    ],
    likes:Array,
    comments:[new mongoose.Schema({
          username:String,
          message:String
    }
    )]
},{
    timestamps: true
});

const Post = new mongoose.model("Post", postSchema);
module.exports = Post;