import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getImageUrl = async (files) => {
  try {
    const postImageLocalPath = files.postImage[0].path;
    const response = await uploadOnCloudinary(postImageLocalPath);
    const cloudinaryUrl = response?.url;
    return cloudinaryUrl;
  } catch (error) {
    throw new ApiError(500, "Error while getting image url.");
  }
};
const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.body;
  if (!postId) {
    throw new ApiError(400, "Please provide post ID");
  }
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post with the provided id deos not exist.");
  }
  try {
    await Post.deleteOne({ _id: postId });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Post deleted successfully."));
  } catch (error) {
    throw new ApiError(500, "Error occurred while deleting the post");
  }
});
const createPost = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  const user = req.user; // using custom auth middleware to add logged in user
  const cloudinaryUrl = await getImageUrl(req.files);
  const postInfo = await Post.create({
    owner: user._id,
    image: cloudinaryUrl,
    caption: caption || "",
  });
  user.posts.push(postInfo._id);
  await user.save({ validateBeforeSave: false });
  const updatedUser = await User.findById(req.user._id);
  return res
    .status(201)
    .json(new ApiResponse(201, postInfo, "Post created Successfully"));
});
const editPost = asyncHandler(async (req, _) => {
  //id and updated data bhejo usko directly update krwaado
  const { id, caption } = req.body;
  const imageUrl = getImageUrl(req.files);
  const latestPost = await Post.findByIdAndUpdate(
    id,
    {
      caption: caption,
      image: imageUrl,
    },
    { new: true }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(200, { post: latestPost }, "Post updated successfully.")
    );
});
const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Requested post does not exist.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post fetched successfully."));
});
const getAllUserPosts = asyncHandler(async (req, res) => {
  const user = req.user;
  const retrievedUser = await User.findById(user?._id);
  if (!retrievedUser) {
    throw new ApiError(404, "User not found");
  }
  const userPosts = retrievedUser.posts;
  const retrievedUserPosts = await Post.find({ _id: { $in: userPosts } });
  if (!retrievedUserPosts) {
    throw new ApiError(500, "Error occurred while getting user posts.");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        retrievedUserPosts,
        "user posts fetched successfully."
      )
    );
});
const generateMyFeed = asyncHandler(async (req, res) => {
  //fetch user whose feed is getting generated
  const loggedInUser = await User.findById(req?.user._id);
  if(!loggedInUser){
    throw new ApiError(500,"Error while fetching user info.");
  }
  //get array of people whom user is following 
  const followingList = loggedInUser.following;
  if(!followingList||followingList.length === 0){
    return res.status(200).json(new ApiResponse(200,[],"You are not following any user yet."))
  }
  //get the array of posts of all users whom the logged in user is following 
  const postsFromFollowingList = await Post.find({author:{$in:followingList}}).sort({createdAt:-1})
  //from those posts generate the feed
  return res.status(200).json(new ApiResponse(200,postsFromFollowingList,"Feed fetched successfully."));
});
const likePost = asyncHandler(async (req, res) => {
  const userWhoLikedThePost = await User.findById(req.user._id);
  if(!userWhoLikedThePost){
    throw new ApiError(400,"Invalid request user does not exist.")
  }
  const {postId} = req.body;
  if(!postId){
    throw new ApiError(400,"Post id is required");
  }
  const postInfo  = await Post.findById(postId);
  if(!postInfo){
    throw new ApiError(404,"Post does not exist.");
  }
  postInfo.likes.push(userWhoLikedThePost._id);
  await postInfo.save({validateBeforeSave:false});
  return res.status(200).json(new ApiResponse(200,{},"post successfully liked."))
});
const unlikePost = asyncHandler(async (req, res) => {
  const userWhoUnlikedThePost = await User.findById(req.user._id);
  if(!userWhoUnlikedThePost){
    throw new ApiError(400,"Invalid request user does not exist.")
  }
  const {postId} = req.body;
  if(!postId){
    throw new ApiError(400,"Post id is required");
  }
  const postInfo  = await Post.findById(postId);
  if(!postInfo){
    throw new ApiError(404,"Post does not exist.");
  }
  postInfo.likes.filter((currUser)=>currUser._id!== userWhoUnlikedThePost._id);
  await postInfo.save({validateBeforeSave:false});
  return res.status(200).json(new ApiResponse(200,{},"Post successfully unliked."))
});
const likeComment = asyncHandler(async (req, res) => {
  const userWholikedTheComment = await User.findById(req.user._id);
  if(!userWholikedTheComment){
    throw new ApiError(400,"Invalid request user does not exist.")
  }
  const {commentId} = req.body;
  if(!commentId){
    throw new ApiError(400,"Comment id is required.");
  }
  const commentInfo  = await Comment.findById(commentId);
  if(!commentInfo){
    throw new ApiError(404,"Comment does not exist.");
  }
  commentInfo.likes.push(userWholikedTheComment._id);
  await commentInfo.save({validateBeforeSave:false});
  return res.status(200).json(new ApiResponse(200,{},"Comment liked successfully."))
});
const unlikeComment = asyncHandler(async (req, res) => {
  const userWhoUnlikedTheComment = await User.findById(req.user._id);
  if(!userWhoUnlikedTheComment){
    throw new ApiError(400,"Invalid request user does not exist.")
  }
  const {commentId} = req.body;
  if(!commentId){
    throw new ApiError(400,"Comment id is required");
  }
  const commentInfo  = await Post.findById(commentId);
  if(!commentInfo){
    throw new ApiError(404,"Comment does not exist.");
  }
  commentInfo.likes.filter((currUser)=>currUser._id!== userWhoUnlikedTheComment._id);
  await commentInfo.save({validateBeforeSave:false});
  return res.status(200).json(new ApiResponse(200,{},"Comment unliked successfully."))
});
const addCommentToPost = asyncHandler(async (req, res) => {
  const userCommenting  = await User.findById(req.user._id);
  if(!userCommenting){
    throw new ApiError(400,"Unauthorized request.");
  }
  const {comment,postId} = req.body;
  if(!comment || !postId){
    throw new ApiError(400,"Please make sure you are making a valid request.");
  }
  const commentedPost = await Post.findById(postId);
  if(!commentedPost){
    throw new ApiError(404,"Post does not exist");
  }
  const newComment = {
    user:userCommenting,
    text:comment,
    likes:[]
  }
  commentedPost.comments.push(newComment);
  await commentedPost.save({validateBeforeSave:false});
  return res.status(201).json(new ApiResponse(201,commentedPost,"Comment added successfully."));

});
const deleteCommentFromPost = asyncHandler(async (req, res) => {
  const userDeletingTheComment  = await User.findById(req.user._id);
  if(!userDeletingTheComment){
    throw new ApiError(400,"Unauthorized request.");
  }
  const {postId,commentId} = req.body;
  if(!postId){
    throw new ApiError(404,"Post with given postId does not exist.");
  }
  if(!commentId){
    throw new ApiError(404,"Comment with given commentId does not exist.");
  }
  const commentedPost = await Post.findById(postId);
  if(!commentedPost){
    throw new ApiError(404,"Post does not exist");
  }
  commentedPost.comments.filter((currComment)=>currComment._id!==commentId);
  await commentedPost.save({validateBeforeSave:false});
  return res.status(200).json(new ApiResponse(200,commentedPost,"Comment deleted successfully."));
});

export {
  likeComment,
  unlikeComment,
  likePost,
  unlikePost,
  addCommentToPost,
  deleteCommentFromPost,
  deletePost,
  createPost,
  editPost,
  getPost,
  getAllUserPosts,
  generateMyFeed,
};
