import * as redisMethods from "../../DB/redis.service.js";
import { MailType } from "../Enums/emailtype.enum.js";
import { BadRequestException } from "../Response/response.js";
import { hashValue } from "../Security/hashing.js";
import { generateOTP } from "../Security/otp.js";
import { sendMail } from "./mail.config.js";

export async function sendOTP({ email, type, subject }) {
  const otpTTL = await redisMethods.ttl(redisMethods.OTPMailKey(email, type));
  if (otpTTL > 0) {
    return BadRequestException(`You cannot request new one before ${otpTTL}s`);
  }

  const isBlocked = await redisMethods.exists(
    redisMethods.OTPBlockedKey(email, type),
  );

  if (isBlocked) {
    return BadRequestException(`Please Try Again Later`);
  }

  const counter = await redisMethods.get(redisMethods.OTPReqNoKey(email, type));

  if (counter == 5) {
    await redisMethods.set({
      key: redisMethods.OTPBlockedKey(email, type),
      value: 1,
      exValue: 10 * 60,
    });
    return BadRequestException(`Reached your limit, Try Again later`);
  }

  const otp = generateOTP();

  await sendMail({
    to: email,
    subject,
    html: `
    <h1> Your OTP is  </h1>
    <h2> ${otp} </h2>
    `,
  });

  await redisMethods.set({
    key: redisMethods.OTPMailKey(email, type),
    value: await hashValue({ value: otp }),
    exValue: 60 * 2,
  });

  await redisMethods.incr(redisMethods.OTPReqNoKey(email, type));
}
