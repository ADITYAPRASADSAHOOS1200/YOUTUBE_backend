
import fs from "fs"
import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({ 
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const uploadCloudinary = async(localFilepath)=>{
//     try{
//        if(!localFilepath){
//           return null
//        }

//      const response=await cloudinary.uploader.upload
//      (localFilepath,{
//         resource_type:"auto"
//        })

//       //  console.log(response);
//       //  console.log("file is upload on cloudinary",response.url);
//        return response;
//     }catch(err){
//          fs.unlinkSync(localFilepath)// remove the locally saved temporarily file as the upload operation get failed
//          return null 
//     }
// }




// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });


const uploadCloudinary = async (localFilepath) => {
   try {
       if (!localFilepath) {
           return null;
       }

       const response = await cloudinary.uploader.upload(localFilepath, { resource_type: "auto" });

       console.log("response Url",response.url);
       fs.unlinkSync(localFilepath)
       return response;
   } catch (err) {
       // Handle upload error
       console.error("Error uploading to Cloudinary:", err);
       // Remove the locally saved temporary file if upload fails
       fs.unlink(localFilepath, (unlinkErr) => {
           if (unlinkErr) {
               console.error("Error deleting temporary file:", unlinkErr);
           }
       });
       return null;
   }
};


const deleteFromCloudinary=async(imageUrl)=>{
    try {
        // Extract the public ID from the image URL
        const publicId = imageUrl.split('/').pop().split('.')[0];
    
        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(publicId);
    
        console.log(`Image ${publicId} deleted successfully from Cloudinary`);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
      }

}

export { uploadCloudinary,deleteFromCloudinary}