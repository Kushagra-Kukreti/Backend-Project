import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAccessAndRefreshToken = async (userId) => {
  //async handler web request me lgta hai
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token."
    );
  }
};
const signUpUser = asyncHandler(async (req, res) => {
  const { email, fullName, password, username } = req.body;
  console.log("req body",req);
  
  if (
    [email, fullName, password, username].some(
      (currField) => currField?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required.");
  }
  //find if user exist
  const user = await User.findOne({
    $or:[{ email }, { username }]
  });
  if (user) {
    throw new ApiError(400, "User with email or username already exist.");
  }
  // create user
  const createdUser = await User.create({
    email:email,
    fullName,
    password,
    username:username,
  });
  if (!createdUser) {
    throw new ApiError(500, "Unable to create user at moment.");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

const logInUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(400, "Username not found.");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Password entered is incorrect.");
  }

  const { accessToken, refreshToken } = await getAccessAndRefreshToken(
    user._id
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  //access and refresh cookies me bhejo

  const loggedInUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      200,
      new ApiResponse(
        200,
        {
          user:loggedInUser,
          refreshToken,
          accessToken,
        },
        "User logged in successfully."
      )
    );
});
const getRefreshToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const newRefreshToken = await user.generateRefreshToken();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {refreshToken:newRefreshToken},
        "Refresh token generated successfully"
      )
    );
});
const getAccessToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const newAccessToken = await user.generateAccessToken();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          accessToken:newAccessToken
        },
        "Access token generated successfully"
      )
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  //cookie htado user ki kyuki server se hi manage hogi
  // aur server se refresh token htado
  //lekin user kaha se laauuu --- hmm to ab bnao middleware
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out!"));
});
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User information fetched successfully."));
});
 

export {
  signUpUser,
  logInUser,
  getRefreshToken,
  getAccessToken,
  logoutUser,
  getMe,
};