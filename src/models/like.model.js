import mongoose, { Schema, Types } from "mongoose"



const likeSchema= Schema ({

    video:{
        type:Schema.Types.ObjectId,
        ref:"video"
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"comment"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    },
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})




export const likes=mongoose.model("like",likeSchema)