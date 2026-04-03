import { TokenType } from "../../Common/Enums/token.enum.js";
import {
  BadRequestException,
  NotFoundException,
} from "../../Common/Response/response.js";
import { decrypt } from "../../Common/Security/encryption.js";
import { compareValue, hashValue } from "../../Common/Security/hashing.js";
import { getSignature, signToken } from "../../Common/Security/token.js";
import * as DBRepo from "../../DB/db.repository.js";
import UserModel from "../../DB/Models/User.model.js";
import * as redisMethods from "../../DB/redis.service.js";
export async function renewToken(userData) {
  const { accessSignature } = getSignature(userData.role);
  const accessToken = signToken({
    signature: accessSignature,
    options: {
      subject: userData._id.toString(),
      audience: [userData.role, TokenType.access],
      expiresIn: 60 * 15,
    },
  });

  return accessToken;
}

export async function uploadProfilePic(userId, fileData) {
  await DBRepo.updateOne({
    model: UserModel,
    filter: { _id: userId },
    data: {
      profilePic: fileData.finalDist,
    },
  });
}

export async function uploadCoverPic(userId, filesData) {
  const filePaths = filesData.map((file) => {
    return file.finalDist;
  });

  await DBRepo.updateOne({
    model: UserModel,
    filter: { _id: userId },
    data: {
      coverPics: filePaths,
    },
  });
}

export async function getAnotherUserProfile(profileId) {
  const user = await DBRepo.findById({
    model: UserModel,
    _id: profileId,
    select:
      "-password -role -provider -confirmEmail -createdAt -updatedAt -__v",
  });

  if (!user) {
    return NotFoundException("profile not found");
  }

  user.phone = decrypt({ cipherText: user.phone });
  return user;
}

export async function logout(userId, tokenData, logoutOptions) {
  if (logoutOptions == "all") {
    await DBRepo.updateOne({
      model: UserModel,
      filter: { _id: userId },
      data: { changeCreditTime: new Date() },
    });
  } else {
    await redisMethods.set({
      key: redisMethods.blackListTokenKey({
        userId,
        tokenId: tokenData.jti,
      }),
      value: tokenData.jti,
      exValue: 60 * 60 * 24 * 365 - (Date.now() / 1000 - tokenData.iat),
    });
  }
}

export async function updatePassword(bodyData, userData) {
  const { oldPassword, newPassword } = bodyData;

  const isOldPasswordValid = await compareValue({
    plainText: oldPassword,
    hashedText: userData.password,
  });

  if (!isOldPasswordValid) {
    return BadRequestException("invalid old password");
  }

  await DBRepo.updateOne({
    model: UserModel,
    filter: { _id: userData._id },
    data: {
      password: await hashValue({ value: newPassword }),
      changeCreditTime: new Date(),
    },
  });
}
