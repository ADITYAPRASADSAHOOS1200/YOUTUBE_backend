import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/Video.model.js";
import { User } from "../models/user.model.js";
import { Comments } from "../models/comment.model.js";
import mongoose from "mongoose";




const getAllComments = asyncHandler(async(req, res) => {
        const { videoId } = req.params;
        const { page = 1, limit = 10 } = req.query;
     
        if (!videoId) {
            throw new ApiError(400, "VideoID Not Found");
        }
    
    
        // Convert page and limit to numbers
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);
        
        try {
           
            const comments = await Comments.aggregate([
                 {
                    $match:{
                      video:new mongoose.Types.ObjectId(videoId) 
                    },
                },
                {
                    $project:{

                        Owner:1,
                        content:1,
                    }
                 },
                
            ]);
         
            console.log(Comments);
            res.status(200).json(
               new ApiResponse(200,comments,"Fetched succesfully")
            );
        } catch (error) {
            console.log(error.message);
            throw new ApiError(500,error?.message ||  "Internal Server Error");
        }
    });





const AddComments=asyncHandler(async(req,res)=>{
    try {
        const {videoId}=req.params;
        const {content} =req.body;
    
        if(!videoId){
            throw new ApiError(400,"VideoId Not Received")
        }
        if(!content){
            throw new ApiError(400,"Content is required")
        }
    
    
        const VideoUserId = await Video.findById(videoId);
    
        if(!VideoUserId){
            throw new ApiError(404,"VideoId Not Found!!")
        }
    
        const UserId= await User.findById(req.user?._id)
    
        if(!UserId){
            throw new ApiError(404,"UserId Not Found!!")
        }
    
    
        const AddComments=await Comments.create({
            content:content,
            video:new mongoose.Types.ObjectId(VideoUserId),
            owner:new mongoose.Types.ObjectId(UserId),
        })
    
        return res.status(200).json(
            new ApiResponse(200,AddComments,"Comments Added Succesfully")
        )
    
    } catch (error) {
        throw new  ApiError(400,error?.message || "Comments Not able To added")
    }

})



const UpdateComments=asyncHandler(async(req,res)=>{
    const { content } = req.body   
    const { videoId } = req.params

   if(!content){
     throw new ApiError(400,"Content not received ")
   }
   if(! videoId ){
    throw new ApiError(400," videoId not received ")
   }
   
    const filter={ video:videoId,owner:req.user?._id}
      
    const Content={content:content.trim()}

    const UpdateComment=await Comments.findOneAndUpdate(filter,Content,{new:true})

    if(UpdateComment === null){
        throw new ApiError(400,"Comment not found!!")
    }

    return res.status(200).json(

        new ApiResponse(200,UpdateComment,"Updated Successfully")

    )

})

const deleteComments=asyncHandler(async(req,res)=>{
   
    const { videoId } = req.params

  
   if(! videoId ){
    throw new ApiError(400," videoId not received ")
   }
   
    const filter={ video:videoId,owner:req.user?._id}
      
    const DeleteComment=await Comments.findOneAndDelete(filter)

    if(DeleteComment === null){
        throw new ApiError(400,"Comment not found!!")
    }

    return res.status(200).json(

        new ApiResponse(200,DeleteComment,"Deleted Successfully")

    )
})


export {
    AddComments,
    getAllComments,
    UpdateComments,
    deleteComments
}