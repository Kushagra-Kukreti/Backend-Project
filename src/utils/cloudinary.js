import cloudinary from 'cloudinary'
import fs from "fs"
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadOnCloudinary(localFilePath){
  try {
      const response = await cloudinary.uploader.upload(localFilePath,{
          resource_type:"auto"
      })
      fs.unlinkSync(localFilePath)
      return response;
      
  } catch (error) {
     console.log("error occured while uploading on cloudinary",error);
     fs.unlinkSync(localFilePath)
  }
}
