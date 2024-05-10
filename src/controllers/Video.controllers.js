import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/Video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadCloudinary } from "../utils/Cloudinary.js";



const getAllvideo=(asyncHandler(async(req,res)=>{

   try {
     const { page = 1, limit = 10, query, sortBy, sortType } = req.query
 
     page=parseInt(page);
     limit=parseInt(query);
 
      const  queryObj={};
      
     if(query){
          queryObj.$or=[
             {title:{$regex:query,$options:'i'}},
             { description: { $regex: query, $options: 'i'}},
          ]
      }
    if(userId){
        queryObj.userId=userId
       }
    
       const SortOptions={};
       if(SortOptions){
          SortOptions[sortBy]=sortType === "dsc" ? -1 : 1;
       }
 
    const video=await Video.find(queryObj).sort(SortOptions).skip((page - 1) * limit).limit(limit)
 
    return res.status(200).json(
          new ApiResponse(200,video,"the video fetched Successfully")
    )
   } catch (error){
       throw new ApiError(400,"user data have not found ")
  }

}))


const publishVideo = asyncHandler(async (req, res) => {

      const { title, description } = req.body;

    
      if (!title) {
          throw new ApiError(400, "Title field is required");
      }
      if (!description) {
          throw new ApiError(400, "Description field is required");
      }

      const videoFiles = req.files?.videoFile;
      
      if (!videoFiles || videoFiles.length === 0) {
          throw new ApiError(400, "Video file not found");
      }
      const videopath = videoFiles[0].path;

      const thumbnailFiles = req.files?.thumbnail;
      if (!thumbnailFiles || thumbnailFiles.length === 0) {
          throw new ApiError(400, "Thumbnail file not found");
      }
      const thumbnailpath = thumbnailFiles[0].path;

  

      const VideoFile = await uploadCloudinary(videopath);
      const thumbnail = await uploadCloudinary(thumbnailpath);

      if (!VideoFile.url) {
          throw new ApiError(400, "VideoFile URL not found");
      }
      if (!thumbnail.url) {
          throw new ApiError(400, "Thumbnail URL not found");
      }

      const VideoCreated = await Video.create({
          title: title,
          description: description,
          VideoFile: VideoFile.url,
          thumbnail: thumbnail.url,
          duration: VideoFile.duration,

      });

      return res.status(200).json(new ApiResponse(200, VideoCreated, "Video created successfully"));
 
});

const getVideoById = asyncHandler(async(req,res)=>{
    const { videoId } = req.params
    console.log(videoId);

    if(!videoId){
        throw new ApiError(400,"videoId Not found")
    }

    const FindVideo=await Video.findById(videoId)

    if(!FindVideo){
        throw new ApiError(400,"Not in found")
    }
    
    return res.status(200).json(
        new ApiResponse(200,FindVideo,"find successfully")
    )


})      

const updateVideoFile=asyncHandler(async(req,res)=>{
    try{
       
        const { videoId } = req.params;

        if(!videoId){
            throw new ApiError(400,"videoId Not found")
        }

       const findvideo=await Video.findById(videoId).select("VideoFile")
       console.log(findvideo);
       if(!findvideo){
          throw ApiError(400,"Video not found provide a proper Id ")
       }
        await deleteFromCloudinary(findvideo?.VideoFile)
       

      const VideoFilepath=req.file?.path

        if(!VideoFilepath){

            throw ApiError(400,"Video File path not found")
        }
        const newVideo=await uploadCloudinary(VideoFilepath)
        if(!newVideo.url){
            throw new ApiError(200,"Not able to generate ")
        }

        const updateVideo=await Video.findByIdAndUpdate(videoId,{
            $set:{
                VideoFile:newVideo?.url,
                duration:newVideo.duration,
            }
        },{
            new:true
        })
    
        return res.status(200).json(
            new ApiResponse(200,updateVideo,"New file generated")
        )

    }catch(err){
          throw new ApiError(400,err?.message,"Unable to update video")
    }
   
})


const updatethumbnail = asyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const { title, description } = req.body;

        console.log(title,description);

        if (!videoId) {
            throw new ApiError(400, "videoId Not found");
        }
        
        const findvideo = await Video.findById(videoId).select("thumbnail");
        if (!findvideo) {
            throw new ApiError(400, "Video not found, please provide a valid videoId");
        }

        // Delete existing thumbnail from Cloudinary
        await deleteFromCloudinary(findvideo.thumbnail);

        // Get the uploaded file from the form data
        const thumbnailFile = req.file;
        if (!thumbnailFile) {
            throw new ApiError(400, "Thumbnail file not found in form data");
        }

        // Upload new thumbnail to Cloudinary
        const newthumbnail = await uploadCloudinary(thumbnailFile.path);
        if (!newthumbnail.url) {
            throw new ApiError(500, "Failed to upload new thumbnail to Cloudinary");
        }

        // Update video with new thumbnail URL
        const updatedVideo = await Video.findByIdAndUpdate(videoId, {
            $set: {
                title: title,
                description: description,
                thumbnail: newthumbnail.url
            }
        }, {
            new: true
        });

        if (!updatedVideo) {
            throw new ApiError(500, "Failed to update video");
        }

        return res.status(200).json({
            success: true,
            message: "Thumbnail updated successfully",
            data: updatedVideo
        });
    } catch (err) {
        // Handle errors
        console.error("Error updating thumbnail:", err.message);
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    }
});






const DeleteVideo =asyncHandler(async(req,res)=>{
    const { videoId } = req.params

    const DeleteVideo= await Video.findByIdAndDelete(videoId);
    if(!DeleteVideo){
        throw new ApiError(400,"Deleted_Video")
    }

    return res.status(200).json(new ApiResponse(200,{},"videoDeletedsuccesfully"))

})



const PublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Check if videoId is provided
    if (!videoId) {
        throw new ApiError(400, "Video Id not received");
    }
    
    // Find the video by ID
    const video = await Video.findById(videoId).select("+isPublished");

    // Check if video exists
    if (!video) {
        throw new ApiError(404, "Video not found in the database");
    }

    // Toggle the publish status of the video
    video.isPublished = !video.isPublished;

    // Save the updated video
    await video.save();

    return res.status(200).json(new ApiResponse(200, video, "Video publish status toggled successfully"));
});



export {
    getAllvideo,
    publishVideo,
    getVideoById,
    updateVideoFile,
    updatethumbnail,
    DeleteVideo,
    PublishStatus
}