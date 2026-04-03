import express from "express";
import * as authService from "./auth.service.js";
import { successResponse } from "../../Common/Response/response.js";
import { validation } from "../../Middleware/validation.middleware.js";
import {
  confirmEmailSchema,
  resendConfirmEmailOTPSchema,
  resendForgetPasswordOTPSchema,
  resetForgetPasswordSchema,
  sendForgetPasswordEmailOTPSchema,
  signupSchema,
  verifyForgetPasswordSchema,
} from "./auth.validation.js";
const authRouter = express.Router();

authRouter.get("/", (req, res) =>
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <script>
      alert("hello world");
    </script>
  </body>
</html>
`),
);

authRouter.post("/signup", validation(signupSchema), async (req, res) => {
  const result = await authService.signup(req.vbody);
  return successResponse({ res, statusCode: 201, data: "check you inbox" });
});

authRouter.post(
  "/confirm-email",
  validation(confirmEmailSchema),
  async (req, res) => {
    const result = await authService.confirmEmailOTP(req.vbody);
    return successResponse({ res, statusCode: 201, data: result });
  },
);

authRouter.post(
  "/forget-password-send-mail",
  validation(sendForgetPasswordEmailOTPSchema),
  async (req, res) => {
    const result = await authService.forgetPasswordSendMail(req.vbody.email);
    return successResponse({ res, statusCode: 201, data: "Check Your Inbox" });
  },
);
authRouter.post(
  "/forget-password-verify",
  validation(verifyForgetPasswordSchema),
  async (req, res) => {
    const result = await authService.forgetPasswordVerifyOtp(req.vbody);
    return successResponse({ res, statusCode: 200, data: "Verified" });
  },
);
authRouter.post(
  "/forget-password-reset-password",
  validation(resetForgetPasswordSchema),
  async (req, res) => {
    const result = await authService.forgetPasswordResetPassword(req.vbody);
    return successResponse({ res, statusCode: 201, data: "Done" });
  },
);

authRouter.post(
  "/resend-otp-confirm-email",
  validation(resendConfirmEmailOTPSchema),
  async (req, res) => {
    const result = await authService.resendOTP(req.vbody.email);
    return successResponse({ res, statusCode: 201, data: "check you inbox" });
  },
);

authRouter.post(
  "/resend-otp-forget-password",
  validation(resendForgetPasswordOTPSchema),
  async (req, res) => {
    const result = await authService.resendOTPForgetPassword(req.vbody.email);
    return successResponse({ res, statusCode: 201, data: "check you inbox" });
  },
);

authRouter.post("/signup/gmail", async (req, res) => {
  const { status, data } = await authService.signupWithGmail(req.body.idToken);

  return successResponse({ res, statusCode: status, data });
});

authRouter.post("/login", async (req, res) => {
  const result = await authService.login(
    req.body,
    `${req.protocol}://${req.host}`,
  );

  return successResponse({ res, data: result });
});

export default authRouter;
