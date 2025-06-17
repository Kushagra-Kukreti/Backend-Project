import { Router } from "express";
import {
  getAccessToken,
  getMe,
  getRefreshToken,
  logInUser,
  logoutUser,
  signUpUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/signup").post(signUpUser);
userRouter.route("/login").post(logInUser);
userRouter.route("/refresh-token").get(verifyJWT,getRefreshToken);
userRouter.route("/access-token").get(verifyJWT,getAccessToken);
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/me").get(verifyJWT,getMe);

export default userRouter