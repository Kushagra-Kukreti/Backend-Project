import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
export const registerUser  = asyncHandler(async (req,res)=>{
    //user se data lo 
    const {email,fullName,username,password} = req.body
    console.log("Email is:",email)
      //check kro vo empty to nahi hai - agr empty hui to error 
      if([email,fullName,username].some((field)=>field?.trim() === "")){
        throw new ApiError(400,"All fields are required")
      }
    //check user already exists - agr krta hai to error

    const existedUser = User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){ //409 error for conflicts or duplicacy
        throw new ApiError(409,"User with email or username already exists")
    }
     
  
    //avatar , images lo 

    const avatarLocalPath  = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    //check kro aayi ki nahi - agr nahi aayi to error
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }
   
    //upload kro 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    //check if uploaded - nahi hua to error
    if(!avatar){
        throw new ApiError(400 , "Avatar is required")
    }

    //then database me save kro - save nahi hua to error  
    const user = User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })
           
    // - ka mtlb password aur refreshtoken htado user mese
    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    //then response bhejo usme se key and password hta do 

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    
    //res.status htaakr direct new Apiresponse bhej skte the but res.status smjhta hai better postman
    return res.status(201).json(new ApiResponse(200,createdUser,"User registered successfully")) 
   

})