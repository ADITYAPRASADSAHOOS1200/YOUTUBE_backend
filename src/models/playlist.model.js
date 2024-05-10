import mongoose,{Schema} from "mongoose"


const PlaylistSchema=new Schema({

    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
     videos:[
        
     {
        types:Schema.Types.ObjectId,
        ref:"video",
     }
    ],
    owner:{
        types:Schema.Types.ObjectId,
        ref:"User",
    }
},{timestamps:true})



export const playlist=mongoose.model("playlist",PlaylistSchema)