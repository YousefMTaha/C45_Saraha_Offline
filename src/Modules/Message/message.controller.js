import express from "express";
import {
  allowedFormats,
  uploadLocal,
} from "../../Common/Multer/multer.conifg.js";
import {
  deleteMsg,
  getAllMsgs,
  getMsgById,
  sendMsg,
} from "./message.service.js";
import {
  BadRequestException,
  successResponse,
} from "../../Common/Response/response.js";
import { authentication } from "../../Middleware/authentication.middleware.js";
import { validation } from "../../Middleware/validation.middleware.js";
import {
  deleteMsgSchema,
  getMsgByIdSchema,
  sendMsgSchema,
} from "./message.validation.js";

const messageRouter = express.Router({ caseSensitive: true, strict: false });
messageRouter.post(
  "/:receiverId",
  (req, res, next) => {
    if (req.headers.authorization) {
      return authentication()(req, res, next);
    }

    next();
  },
  uploadLocal({
    folderName: "Message",
    allowedFileFormat: [...allowedFormats.image, ...allowedFormats.video],
    fileSize: 50,
  }).array("msgAttachments", 5),

  validation(sendMsgSchema),

  async (req, res) => {
    if (!req.body?.content && !req.files) {
      return BadRequestException("you need to send at least content or file");
    }

    await sendMsg(
      req.vbody.content,
      req.files,
      req.params.receiverId,
      req.user?._id,
    );
    return successResponse({ res, data: "message sent" });
  },
);

messageRouter.get(
  "/get-msg-by-id/:messageId",
  authentication(),
  validation(getMsgByIdSchema),
  async (req, res) => {
    const result = await getMsgById(req.params.messageId, req.user._id);
    return successResponse({ res, data: result });
  },
);

messageRouter.get("/get-all-msgs", authentication(), async (req, res) => {
  const result = await getAllMsgs(req.user._id);
  return successResponse({ res, data: result });
});

messageRouter.delete(
  "/:messageId",
  authentication(),
  validation(deleteMsgSchema),
  async (req, res) => {
    await deleteMsg(req.params.messageId, req.user._id);
    return successResponse({ res, data: "Message Deleted" });
  },
);
export default messageRouter;
