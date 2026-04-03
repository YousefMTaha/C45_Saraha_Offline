import express from "express";
import * as userService from "./user.service.js";
import { successResponse } from "../../Common/Response/response.js";
import { authentication } from "../../Middleware/authentication.middleware.js";
import { TokenType } from "../../Common/Enums/token.enum.js";
import { UserRole } from "../../Common/Enums/user.enum.js";
import { authorization } from "../../Middleware/authorization.middleware.js";
import {
  allowedFormats,
  uploadLocal,
} from "../../Common/Multer/multer.conifg.js";
import { validation } from "../../Middleware/validation.middleware.js";
import {
  coverPicsSchema,
  getAnotherProfileSchema,
  profilePicSchema,
  updatePasswordSchema,
} from "./user.validation.js";

const userRouter = express.Router();

userRouter.get("/", (req, res) => successResponse({ res, data: "user page" }));

userRouter.get(
  "/getProfile",
  authentication(),
  authorization([UserRole.admin]),
  async (req, res) => {
    return successResponse({ res, data: req.user });
  },
);

userRouter.post(
  "/renew-token",
  authentication(TokenType.refresh),
  async (req, res) => {
    const result = await userService.renewToken(req.user);
    return successResponse({ res, data: result });
  },
);

userRouter.post(
  "/profile-pic",
  authentication(),
  uploadLocal({
    folderName: "User",
    allowedFileFormat: allowedFormats.image,
    fileSize: 10,
  }).single("profilePic"),
  validation(profilePicSchema),
  async (req, res) => {
    const result = await userService.uploadProfilePic(req.user._id, req.file);
    return successResponse({ res, data: result });
  },
);

userRouter.post(
  "/cover-pics",
  authentication(),
  uploadLocal({
    folderName: "User",
    allowedFileFormat: allowedFormats.image,
    fileSize: 20,
  }).array("coverPictures", 5),
  validation(coverPicsSchema),
  async (req, res) => {
    const result = await userService.uploadCoverPic(req.user._id, req.files);
    return successResponse({ res, data: result });
  },
);

userRouter.get(
  "/shared-profile/:profileId",
  validation(getAnotherProfileSchema),
  async (req, res) => {
    const result = await userService.getAnotherUserProfile(
      req.params.profileId,
    );
    return successResponse({ res, data: result });
  },
);

userRouter.post("/logout", authentication(), async (req, res) => {
  const result = await userService.logout(
    req.user._id,
    req.tokenPayload,
    req.body.logoutOption,
  );
  return successResponse({ res, data: result });
});

userRouter.patch(
  "/update-password",
  authentication(),
  validation(updatePasswordSchema),
  async (req, res) => {
    const result = await userService.updatePassword(req.vbody, req.user);
    return successResponse({ res, data: "changed" });
  },
);
export default userRouter;
