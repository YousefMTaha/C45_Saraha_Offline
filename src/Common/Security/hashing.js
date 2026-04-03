import { compare, hash } from "bcrypt";
import { SALT_ROUND } from "../../../config/config.service.js";

export async function hashValue({ value, rounds = SALT_ROUND }) {
  return await hash(String(value), rounds);
}

export async function compareValue({ plainText, hashedText }) {
  return await compare(String(plainText), hashedText);
}
