import { ApiError } from "../utils/Apierror.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import * as EmailValidator from 'email-validator';
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromCloudinary } from "../utils/Cloudinary.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


const generateAccessTokenandrefereshtokens=async(userId)=>{
  try{
 
     const user=await User.findById(userId)
     
     const access_Token=user.generateAccessToken()
     const refresh_token=user.refreshtoken()
      
     user.refreshToken=refresh_token
     await user.save({validateBeforeSave:false})

     return {access_Token,refresh_token}

  }catch(err){
    throw new ApiError(500,"something wrong in generating the tokens ")
  }
 }



 const registeruser = asyncHandler( async( req , res )=>{

   const {username,email,password,fullname}=req.body
  
     if([username,email,password,fullname].some((field) => field?.trim()  === "" )){
         throw new ApiError( 400 , "all fields  are required" );
     }

     const validtaion=EmailValidator.validate(email);
     if(!validtaion){
       throw new ApiError ( 400 ,"invalid email format ")
     }
    

  const existeduser=await User.findOne({ $or : [ {email},{username} ]})
  
     if(existeduser !== null){
        throw new ApiError(409,"user Already existed email or username")
     }
      // console.log(existeduser);
      console.log(req.files);
     const avatarlocalPath = req.files?.avatar[0]?.path;

    //  const coverImagelocalpath=req.files?.coverImage[0]?.path;

      let coverImagelocalpath;
      if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
           coverImagelocalpath=req.files.coverImage[0].path
      }




      // console.log("requested filess-----------------",req.files);


    //  console.log(avatarlocalPath,coverImagelocalpath);

     if (!avatarlocalPath){
       throw new ApiError ( 400 ," avatar file is required ");
     }

     const Avatar = await uploadCloudinary(avatarlocalPath)
     const coverImage = await uploadCloudinary(coverImagelocalpath)

     if(!Avatar){ 
      throw new ApiError(400,"Avatar file is required")
     }

    //  console.log(req.files);

     const userCreated = await User.create({
           fullname,
           avatar:Avatar.url,
           coverImage:coverImage?.url, //if there is cover image then put url or it remains empty;
           email,
           password,
           username:username.toLowerCase()
      })
       
     const CreatedUser = await User.findById(userCreated._id).select("-password,-refreshToken")
      if(!CreatedUser){
          throw new ApiError ( 500," something problem in registering the User" )
      }
 
      return res.status(201).json(
        new ApiResponse(200,CreatedUser,"User registered succesfully!")
      )

   
 })


 const loginUser = asyncHandler (async(req,res)=>{
   
     //take email and password from req.body
     //username
     //find the user is found or not
     //check the password  correct or not 
     //generate a Access token 
     //provide a refresh token 
     //then send response to the client logged in or not
     //cookies

     const {username,email,password}=req.body
    
     if(!(username || email)){
        throw new ApiError(400,"username or email is required")
     }
      // console.log(username,email);
     const user = await User.findOne({ $or: [{ username: username }, { email: email }] });
       
      // console.log("db",user);
     if(!user){
       throw new ApiError(404,"User Not Found !");
     }

     const Password = await user.isPasswordCorrect(password)

     if(!Password){
      throw  new ApiError(401,"invalid credentials ")
     }

   const {access_Token,refresh_token} = await generateAccessTokenandrefereshtokens(user._id)
    
   const loggedIn=await User.findById(user._id).select("-password -refreshToken")


   const CookieOption={
    httpOnly:true,
    secure:true
   }

   
     return res.status(200).cookie("access_Token",access_Token,CookieOption)
     .cookie("refresh_token",refresh_token,CookieOption )
     .json(
      new ApiResponse(200,{
        user:loggedIn,access_Token,refresh_token
      },"User is logged in")
     )

 })

 const logoutuser = asyncHandler(async (req, res) => {
  try {
    // console.log(req.user._id);
    const user = await User.findByIdAndUpdate(req.user._id, {
      $set: {
        refreshToken: undefined
      }
    }, {
      new: true
    });

    if (!user) {
      throw new Error("User not found");
    }

    const CookieOption = {
      httpOnly: true,
      secure: true
    };

    return res.status(200)
      .clearCookie("access_Token", CookieOption)
      .clearCookie("refresh_token", CookieOption)
      .json(new ApiResponse(200, null, "UserLoggedOut"));

  } catch (error) {
    // Handle errors here
    // console.error(error); // Log the error for debugging
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
});


 const refreshAccessToken=asyncHandler(async(req,res)=>{
    
try {
    const incomingRefreshToken=req.cookies.refresh_token || req.body.refresh_token
     
  
    if(!incomingRefreshToken){   
    throw new ApiError(401,"unauthorized request")
     }
  
    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id);
  
     if(!user){
      throw new ApiError(401,"Invalid Refresh Token")
     }

    //  console.log(incomingRefreshToken);
  
    console.log(user.refreshToken);
       if( incomingRefreshToken !==  user.refreshToken){ 
        throw new ApiError(401,"Refresh token is expired or used")
       }
  

         const options={
  
              httpOnly:true,
              secure:true,
         }
  
         const {access_Token,refresh_token} =await generateAccessTokenandrefereshtokens(user._id)
       
         return res.status(200).cookie("access_Token",access_Token,options)
         .cookie("refresh_token",refresh_token,options).json(
            new ApiResponse(
              200,
              {access_Token,new:refresh_token},
              "Access token Refreshed"
            ))
} catch (error) {

  throw new ApiError(401,error?.message || "Invalid refresh token")

}
        
})

const ChangeCurrentPassword=asyncHandler(async(req,res)=>{
  
     const {oldPassword,newPassword,confirmPassword}=req.body;

      
     if(newPassword !== confirmPassword){
       throw new ApiError(400,"Invalid  old password") 
     }

     console.log(req.user);


     const user=await User.findById(req.user._id)
     
 
     if(!user){
       throw new ApiError(401,"User Not found");   
     }

    const Passwordchecked=await user.isPasswordCorrect(oldPassword)
    if(!Passwordchecked){
      throw new ApiError (400,"Invalid Old Password");
    }

    user.password=newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{},"Password changed Successfully"))

})



const getCurrentUser = asyncHandler(async(req,res)=>{

   try {
     const user= await User.findById(req.user?._id).select("-password -refreshToken")
     if(!user){
        throw new ApiError(404,"User not Found!")
     }
 
     return res.status(200).json(
       new ApiResponse(201,user,"user Found")
     )
 
   } catch (error) {
      throw new ApiError(404,error?.message || "user not found")
   }
})


const UpdateAccoutDetails=(async(req,res)=>{
    
  try {
      const{username,fullname,email}=req.body;
      
    //   const user =await User.findById(req.user?._id)
      
    //   if(!user){
    //     throw new ApiError(404,"User not Found!")
    //  }

      if(!(username || fullname || email)){
        throw new ApiError(400,"All field are required")

      }

     const updateuser=await User.findByIdAndUpdate(req.user?._id,{
      $set:{
         username:username,
         fullname:fullname,
         email:email,
      }},{
        new: true,
     }).select("-password -refreshToken")


     if(!updateuser){
       throw new ApiError(404,"user not able to update")
     }
  
    //  user.username=username

      // await user.save({validateBeforeSave:false})
     return res.status(200).json(
      new ApiResponse(201,updateuser,"userDetails Updated")
    )
  } catch (error) {
     throw new ApiError(404,error?.message,"userDetails not found ")
  }

});

const updateUserAvatar=asyncHandler(async( req , res)=>{

 try {

  const user= await User.findById(req.user?._id).select("avatar");
  console.log(user);
 
  if(user === null){
      throw new ApiError( 400 ," user avatar is missing ")
  }

    await deleteFromCloudinary(user?.avatar)

  
     const avatarlocalPath = req.file?.path;

  
     if(!avatarlocalPath){
       throw new ApiError(400,"avatar file is missing")
     }
      


     const avatar=await uploadCloudinary(avatarlocalPath)

     if(!avatar.url){
      throw new ApiError(400,"avatar url is missing")
    }

 
    
    
 
     const updateuser=await User.findByIdAndUpdate(req.user?._id,{
       $set:{
           avatar:avatar.url
       }
       },{
         new:true,
       }).select("-password -refreshToken")
 
       return res.status(200).json(
         new ApiResponse(200,updateuser,"Avatar image updated successfully")
       )
 } catch (error) {

  throw new ApiError( 400 , error?.message , " avatar not able to update ")

 }


    
})

const updateCoverImage=asyncHandler(async( req , res)=>{
  try {

    const user= await User.findById(req.user?._id).select("coverImage");
    console.log(user);
   
    if(user === null){
        throw new ApiError( 400 ," user avatar is missing ")
    }
  
      await deleteFromCloudinary(user?.coverImage)
  
    
       const coverImagepath = req.file?.path;
  
    
       if(!coverImagepath){
         throw new ApiError(400,"avatar file is missing")
       }
        
  
  
       const coverImage=await uploadCloudinary(coverImagepath)
  
       if(!coverImage.url){
        throw new ApiError(400,"avatar url is missing")
      }
  
       const updateuser=await User.findByIdAndUpdate(req.user?._id,{
         $set:{
          coverImage:coverImage.url
         }
         },{
           new:true,
         }).select("-password -refreshToken")
   
         return res.status(200).json(
           new ApiResponse(200,updateuser,"Avatar image updated successfully")
         )
   } catch (error) {
  
    throw new ApiError( 400 , error?.message , " avatar not able to update ")
  
   }
   

})




const getUserChannelProfile=asyncHandler(async(req,res)=>{
    
  const { username } = req.params

  if(!username ?.trim()){
    throw ApiError(400,"username is missing")
  }

const Channel =await User.aggregate([
  {
    $match: {
      "username": username?.toLowerCase()
    }
  },
  {
    $lookup: {
      "from": "subscriptions",
      "localField": "_id",
      "foreignField": "channel",
      "as": "subscribers"
    }
  },
  {
    $lookup: {
      from: "Subscriptions",
      
      localField: "_id",
      foreignField: "subscriber",
      as: "subscribedTo"
    }
  },
  {
    $addFields: {
      subcribersCount: {
        $size: "$subscribers"
      },
      channelSubscribedToCount: {
        $size: "$subscribedTo"
      }
    }
  },
  {
    $addFields: {
      "isSubscribed": {
        $cond: {
          if: {
            $in: [req.user?._id, "$subscribers.subscriber"]
          },
          "then": true,
          "else": false
        }
      }
    }
  },
  {
    $project: {
      "fullname": 1,
      "username": 1,
      "subcribersCount": 1,
      "channelSubscribedToCount": 1,
      "avatar": 1,
      "isSubscribed": 1
    }
  }
]
)
  console.log(Channel);
  if(!Channel.length){
    throw ApiError(400,"channel does not exist")
  }

 return res.status(200).json(
  new ApiResponse(200,Channel[0],"userChannel fetched successfully ")
)


})



const getwatchHistory=asyncHandler(async(req,res)=>{


  const user=await User.aggregate([
    {
        $match:{
            _id:new mongoose.Types.ObjectId(req.user?._id)
        }
    },
    {
      $lookup:{
          from:"videos",
          localField:"watchHistory",
          foreignField:"_id",
          as:"history",
          pipeline:[
            {
              $lookup:{
                 from:"users",
                 localField:"Owner",
                 foreignField:"_id",
                 as:"Owner",
                 pipeline:[
                     {
                       $project:{
                         fullName:1,
                         username:1,
                           avatar:1
                       }
                     }
                 ]
              }
            },
           {
            $addFields:{
              owner:{
               $first:"$Owner"
                 }
              }
           }
        ]
      }
    }
  ]) 

  
  if (!user || !user[0] || !user[0].watchHistory ) {
    return res.status(404).json({ success: false, message: "Watch history not found" });
  }

  return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "Fetch successful"));

 

})

export { 
           registeruser,
           loginUser,
           logoutuser,
           refreshAccessToken,
           ChangeCurrentPassword,
           getCurrentUser,
           UpdateAccoutDetails,
           updateUserAvatar,
           updateCoverImage,
           getUserChannelProfile,
           getwatchHistory,
       }
