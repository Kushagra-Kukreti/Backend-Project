import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addCommentToPost,
  deleteCommentFromPost,
  likeComment,
  unlikeComment,
} from "../controllers/post.controller.js";

export const commentRouter = Router();
//comments
commentRouter
  .patch("/:postId/comment/:commentId/like", verifyJWT, likeComment)
  .patch("/:postId/comment/:commentId/unlike", verifyJWT, unlikeComment)
  .patch("/:postId/comment", verifyJWT, addCommentToPost)
  .patch("/:postId/comment/:commentId", verifyJWT, deleteCommentFromPost);
