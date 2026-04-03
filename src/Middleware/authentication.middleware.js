import { TokenType } from "../Common/Enums/token.enum.js";
import {
  BadRequestException,
  NotFoundException,
  UnAuthorizedException,
} from "../Common/Response/response.js";
import {
  decodeToken,
  getSignature,
  verifyToken,
} from "../Common/Security/token.js";
import * as DBRepo from "../DB/db.repository.js";
import * as redisMethods from "../DB/redis.service.js";
import UserModel from "../DB/Models/User.model.js";

export function authentication(actualTokenType = TokenType.access) {
  return async (req, res, next) => {
    const { authorization } = req.headers;

    const [bearerKey, token] = authorization.split(" ");

    if (bearerKey != "Bearer") {
      return BadRequestException("invalid bearer key");
    }

    const decoded = decodeToken(token);

    const [userRole, tokenType] = decoded.aud;

    if (tokenType != actualTokenType) {
      return BadRequestException("invalid token type");
    }

    const { accessSignature, refreshSignature } = getSignature(userRole);

    const verifiedToken = verifyToken({
      token: token,
      signature:
        TokenType.refresh == tokenType ? refreshSignature : accessSignature,
    });

    if (
      await redisMethods.get(
        redisMethods.blackListTokenKey({
          userId: verifiedToken.sub,
          tokenId: verifiedToken.jti,
        }),
      )
    ) {
      return UnAuthorizedException("You need to login again");
    }

    const user = await DBRepo.findById({
      model: UserModel,
      _id: verifiedToken.sub,
    });

    if (!user) {
      return UnAuthorizedException("Account not found, Signup First!");
    }

    if (verifiedToken.iat * 1000 < user.changeCreditTime) {
      return UnAuthorizedException("You need to login again");
    }

    req.user = user;
    req.tokenPayload = verifiedToken;
    next();
  };
}
