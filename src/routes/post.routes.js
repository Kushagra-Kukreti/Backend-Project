import { Router } from "express";
import {
  createPost,
  deletePost,
  editPost,
  generateMyFeed,
  getAllUserPosts,
  getPost,
  likePost,
  unlikePost,
} from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

export const postRouter = Router();

//secure routes
postRouter
  .post("/", upload.fields([{name:"postImage",maxCount:1}]),verifyJWT, createPost)
  .get("/me",verifyJWT, getAllUserPosts)
  .get("/feed",verifyJWT, generateMyFeed)
  .get("/:postId",verifyJWT, getPost)
  .patch("/:postId",verifyJWT, editPost)
  .delete("/:postId",verifyJWT, deletePost)
  //likes
  .patch("/:postId/like",verifyJWT, likePost)
  .patch("/:postId/unlike",verifyJWT, unlikePost)
 
