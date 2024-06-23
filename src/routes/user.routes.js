import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields(
    // middleware aisi use krte hai ki file upload krpaaye post krne se
    // pehle
    [
      {
        name: "avatar",
        maxCount: 1,
      },
      {
        name: "coverImage",
        maxCount: 1,
      },
    ]
  ),
  registerUser
);
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(authMiddleware,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router;
