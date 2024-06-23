import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(400, "User not found");
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    console.log("Works fine till save");
    await user.save({ validateBeforeSave: false });
    console.log("access before return ", accessToken);
    console.log("refresh before return ", refreshToken);
    return { accessToken, refreshToken };
  } catch (error) {
    console.log("error ", error);
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  //user se data lo
  const { email, fullName, username, password } = req.body;
  console.log("Email is:", email);
  //check kro vo empty to nahi hai - agr empty hui to error
  if ([email, fullName, username].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  //check user already exists - agr krta hai to error

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    //409 error for conflicts or duplicacy
    throw new ApiError(409, "User with email or username already exists");
  }

  //avatar , images lo

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    req.files.coverImage &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    //check kro aayi ki nahi - agr nahi aayi to error
    throw new ApiError(400, "Avatar file is required");
  }

  //upload kro
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //check if uploaded - nahi hua to error
  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  //then database me save kro - save nahi hua to error
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // - ka mtlb password aur refreshtoken htado user mese
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  //then response bhejo usme se key and password hta do

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //res.status htaakr direct new Apiresponse bhej skte the but res.status smjhta hai better postman
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // data from req
  const { username, email, password } = req.body;

  console.log("Email is in login ", email);
  console.log("Password is in login ", password);
  console.log("Request body", req.body);

  if (!(email || username)) {
    throw new ApiError(400, "Please provide username or password");
  }

  if (!password) {
    throw new ApiError(400, "Please provide password details");
  }

  //find by email or username
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  //check if present
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  // check for password correctness
  const isCorrect = await user.isPasswordCorrect(password);
  if (!isCorrect) {
    throw new ApiError(401, "Password is incorrect");
  }
  //generate access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  //send cookie

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  console.log("access", accessToken);
  console.log("refresh", refreshToken);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken, user: loggedInUser },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //user ka info chahiye -- iske liye middleware lgega
  //user ka refresh token db se htado - server side
  //new true study about it
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  //cookies clear krdo - client side pr
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;
  
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }
  
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedToken) {
      throw new ApiError(401, "Invalid refresh token");
    }
    const user = await User.findById(decodedToken._id);
  
    if(!user){
      throw new ApiError(401, "Incorrect refresh token")
    }
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Unauthorised request");
    }
  
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
  
    return res
      .status(200)
      .cookie("accessToken",accessToken)
      .cookie("refreshToken",refreshToken)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access token refreshed"
        )
      );
} catch (error) {
  new ApiError(500,error?.message||"Invalid refresh token")
}
});
export { loginUser, registerUser, logoutUser, refreshAccessToken };
