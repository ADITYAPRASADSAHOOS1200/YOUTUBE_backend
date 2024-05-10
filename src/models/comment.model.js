import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"


const CommentSchema= new mongoose.Schema ({

    content:{
        type:String,
        required:true,
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"video"
    },
    owner:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }


},{timestamps:true})


CommentSchema.plugin(mongooseAggregatePaginate)



export const Comments=mongoose.model("comments",CommentSchema)

