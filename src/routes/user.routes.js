import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar } from "../controllers/user.controller.js";
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
router.route("/change-password").post(authMiddleware,changeCurrentPassword)
router.route("/fetch-user").get(authMiddleware,getCurrentUser)
router.route("/update-details").post(authMiddleware,updateAccountDetails)
router.route("/update-avatar").post(upload.single("avatar"),authMiddleware,updateUserAvatar)

export default router;
