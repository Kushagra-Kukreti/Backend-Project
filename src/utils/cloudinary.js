import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const uploadOnCloudinary  = async (localFilePath)=>{

    try {
        if(!localFilePath)return null;
        //upload file on cloudinary 
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log("File uploaded successfully",response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
       fs.unlinkSync(localFilePath);
       //remove from your localserver since upload got failed
       return null;
    }

}



//REFERENCE CODE FOR CLOUDINARY

 
// const uploadResult = await cloudinary.uploader
//   .upload(
//     "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
//     {
//       public_id: "shoes",
//     }
//   )
//   .catch((error) => {
//     console.log(error);
//   });
