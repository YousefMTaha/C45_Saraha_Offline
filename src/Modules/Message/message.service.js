import { NotFoundException } from "../../Common/Response/response.js";
import * as DBRepo from "../../DB/db.repository.js";
import MessageModel from "../../DB/Models/Message.model.js";
import UserModel from "../../DB/Models/User.model.js";

export async function sendMsg(content, filesData, receiverId, senderId) {
  const receiver = await DBRepo.findById({
    model: UserModel,
    _id: receiverId,
  });

  if (!receiver) {
    return NotFoundException("Invalid user data");
  }

  await DBRepo.create({
    model: MessageModel,
    data: {
      content,
      attachments: filesData.map((file) => file.finalDist),
      senderId,
      receiverId,
    },
  });
}

export async function getMsgById(messageId, receiverId) {
  const msg = await DBRepo.findOne({
    model: MessageModel,
    filter: {
      _id: messageId,
      receiverId,
    },
    select: "-senderId",
  });

  if (!msg) {
    return NotFoundException("Msg not found");
  }

  return msg;
}

export async function getAllMsgs(userId) {
  const msgs = await DBRepo.find({
    model: MessageModel,
    filter: {
      $or: [{ senderId: userId }, { receiverId: userId }],
    },
    select: "-senderId",
  });

  if (!msgs.length) {
    return NotFoundException("no msgs yet");
  }

  return msgs;
}

export async function deleteMsg(messageId, userId) {
  const result = await DBRepo.deleteOne({
    model: MessageModel,
    filter: {
      receiverId: userId,
      _id: messageId,
    },
  });

  if (!result.deletedCount) {
    return NotFoundException("Msg not found");
  }
}
