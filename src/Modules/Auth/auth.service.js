import { MailType } from "../../Common/Enums/emailtype.enum.js";
import { Provider } from "../../Common/Enums/user.enum.js";
import { sendOTP } from "../../Common/Mail/mail.service.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnAuthorizedException,
} from "../../Common/Response/response.js";
import { encrypt } from "../../Common/Security/encryption.js";
import { compareValue, hashValue } from "../../Common/Security/hashing.js";
import { generateToken } from "../../Common/Security/token.js";
import UserModel from "../../DB/Models/User.model.js";
import * as DBRepo from "../../DB/db.repository.js";
import * as redisMethods from "../../DB/redis.service.js";
import { OAuth2Client } from "google-auth-library";

export async function signup(bodyData) {
  const { email } = bodyData;

  const isEmail = await DBRepo.findOne({ model: UserModel, filter: { email } });

  if (isEmail) {
    return ConflictException("Email Already exists");
  }

  bodyData.password = await hashValue({ value: bodyData.password });

  const cipherPhone = encrypt({ value: bodyData.phone });
  bodyData.phone = cipherPhone;

  const newUser = await DBRepo.create({ model: UserModel, data: bodyData });

  await sendOTP({
    email,
    type: MailType.confirmEmail,
    subject: "Confirm Your Email",
  });

  return newUser;
}

export async function confirmEmailOTP(bodyData) {
  const { email, otp } = bodyData;

  const user = await DBRepo.findOne({ model: UserModel, filter: { email } });

  if (!user) {
    return BadRequestException("Email Not Exists");
  }

  if (user.confirmEmail) {
    return BadRequestException("Email Already confirmed");
  }

  const hashedOtp = await redisMethods.get(redisMethods.OTPMailKey(email));
  if (!hashedOtp) {
    return BadRequestException("OTP Expired");
  }

  const isOtpValid = await compareValue({
    plainText: otp,
    hashedText: hashedOtp,
  });

  if (!isOtpValid) {
    return BadRequestException("Invalid OTP");
  }

  user.confirmEmail = true;
  await user.save();

  return;
}

export async function resendOTP(email) {
  await sendOTP({
    email,
    type: MailType.confirmEmail,
    subject: "Another OTP to confirm your email",
  });
  return;
}

export async function resendOTPForgetPassword(email) {
  await sendOTP({
    email,
    type: MailType.forgetPassword,
    subject: "Another OTP to reset your password",
  });
  return;
}

export async function login(bodyData) {
  const { password, email } = bodyData;

  const user = await DBRepo.findOne({ model: UserModel, filter: { email } });

  if (!user) {
    return UnAuthorizedException("invalid data");
  }

  if (!user.confirmEmail) {
    return BadRequestException("Confirm your email first");
  }

  const isPasswordMatch = await compareValue({
    plainText: password,
    hashedText: user.password,
  });
  if (!isPasswordMatch) {
    return UnAuthorizedException("invalid data");
  }

  const { access_token, refresh_token } = generateToken(user);

  return { access_token, refresh_token };
}

export async function forgetPasswordSendMail(email) {
  const user = await DBRepo.findOne({
    model: UserModel,
    filter: { email, confirmEmail: true },
  });

  if (!user) {
    return;
  }

  await sendOTP({
    email,
    type: MailType.forgetPassword,
    subject: "OTP To Reset Your Password",
  });
  return;
}

export async function forgetPasswordVerifyOtp(bodyData) {
  const { email, otp } = bodyData;

  const existsOTP = await redisMethods.get(
    redisMethods.OTPMailKey(email, MailType.forgetPassword),
  );

  if (!existsOTP) {
    return BadRequestException("OTP expired");
  }

  const isOtpValid = await compareValue({
    plainText: otp,
    hashedText: existsOTP,
  });
  if (!isOtpValid) {
    return BadRequestException("OTP not valid");
  }
}

export async function forgetPasswordResetPassword(bodyData) {
  const { email, otp, password } = bodyData;

  console.log(password);

  await forgetPasswordVerifyOtp({ email, otp });

  await DBRepo.updateOne({
    model: UserModel,
    filter: { email },
    data: {
      password: await hashValue({ value: password }),
    },
  });
}

/**

{
    iss: 'https://accounts.google.com',
    azp: '752000862141-u2sk0bpf8rub95utto4ocns8nfcj6pi5.apps.googleusercontent.com',
    aud: '752000862141-u2sk0bpf8rub95utto4ocns8nfcj6pi5.apps.googleusercontent.com',
    sub: '111746587744581313356',
    email: 'tyousef262@gmail.com',
    email_verified: true,
    nbf: 1772220924,
    name: 'Yousef Taha',
    picture: 'https://lh3.googleusercontent.com/a/ACg8ocK1oyANMxdOqziFTLAYJ24ITcL3_u8cfbzO-gkKdSoPooO5xw=s96-c',
    given_name: 'Yousef',
    family_name: 'Taha',
    iat: 1772221224,
    exp: 1772224824,
    jti: '518d49b1ec7c02c07b2f20641af2801e715a0eb9'
  }
 */

async function verifyTokenId(token) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience:
      "752000862141-u2sk0bpf8rub95utto4ocns8nfcj6pi5.apps.googleusercontent.com",
  });

  return ticket.getPayload();
}

export async function signupWithGmail(idToken) {
  const payload = await verifyTokenId(idToken);

  if (!payload.email_verified) {
    return BadRequestException("Verify your email");
  }

  const user = await DBRepo.findOne({
    model: UserModel,
    filter: { email: payload.email },
  });

  if (user) {
    if (user.provider != Provider.google) {
      return BadRequestException(
        "Already have account, login with your email and password",
      );
    }

    const { access_token, refresh_token } = generateToken(user);

    return { status: 200, data: { access_token, refresh_token } }; // login
  }

  const newUser = await DBRepo.create({
    model: UserModel,
    data: {
      userName: payload.name,
      email: payload.email,
      provider: Provider.google,
      profilePic: payload.picture,
      confirmEmail: true,
    },
  });

  const { access_token, refresh_token } = generateToken(newUser);

  return { status: 201, data: { access_token, refresh_token } };
}

export async function loginWithGmail(idToken) {
  const payload = await verifyTokenId(idToken);

  if (!payload.email_verified) {
    return BadRequestException("Verify your email");
  }

  const user = await DBRepo.findOne({
    model: UserModel,
    filter: { email: payload.email, provider: Provider.google },
  });

  if (!user) {
    return signupWithGmail(idToken);
  }

  const { access_token, refresh_token } = generateToken(user);

  return { access_token, refresh_token };
}
