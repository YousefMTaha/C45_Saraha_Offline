import CryptoJS from "crypto-js";
import { ENCRYPTION_KEY } from "../../../config/config.service.js";

export function encrypt({ value, encKey = ENCRYPTION_KEY }) {
  return CryptoJS.AES.encrypt(value, encKey).toString();
}

export function decrypt({ cipherText, encKey = ENCRYPTION_KEY }) {
  const bytes = CryptoJS.AES.decrypt(cipherText, encKey);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);

  return originalText;
}
