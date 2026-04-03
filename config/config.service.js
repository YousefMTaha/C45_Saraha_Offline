import dotenv from "dotenv";
import path from "path";

export const NODE_ENV = process.env.NODE_ENV; // dev , prod

const envPath = {
  dev: path.resolve("./config/.env.dev"),
  prod: path.resolve("./config/.env.prod"),
};

dotenv.config({ path: envPath[NODE_ENV || "dev"] });

export const SERVER_PORT = process.env.PORT || 3000;

export const MAIL_PASS = process.env.MAIL_PASS || 3000;
export const MAIL_USER = process.env.MAIL_USER || 3000;

export const DB_URL_LOCAL = process.env.DB_URL_LOCAL || "";
export const DB_URL_ATLAS = process.env.DB_URL_ATLAS || "";
export const REDIS_URL = process.env.REDIS_URL || "";

export const SALT_ROUND = parseInt(process.env.SALT_ROUND) || 10;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

export const TOKEN_SIGNATURE_USER_ACCESS = process.env.TOKEN_SIGNATURE_USER;
export const TOKEN_SIGNATURE_ADMIN_ACCESS = process.env.TOKEN_SIGNATURE_ADMIN;
export const TOKEN_SIGNATURE_USER_REFRESH =
  process.env.TOKEN_SIGNATURE_USER_REFRESH;
export const TOKEN_SIGNATURE_ADMIN_REFRESH =
  process.env.TOKEN_SIGNATURE_ADMIN_REFRESH;
