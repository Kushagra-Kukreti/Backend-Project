import mongoose, { Schema } from "mongoose";


const postSchema = new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    caption:{
       type:String
    },
    image:{
        type:String,
        required:true
    },
    likes:[String],
    comments:[{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    }]

},{timestamps:true})

export const Post = mongoose.model("Post",postSchema)