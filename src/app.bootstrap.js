import express from "express";
import { SERVER_PORT } from "../config/config.service.js";
import testDBConnection from "./DB/connection.js";
import {
  BadRequestException,
  globalErrHandling,
} from "./Common/Response/response.js";
import authRouter from "./Modules/Auth/auth.controller.js";
import userRouter from "./Modules/User/user.controller.js";
import messageRouter from "./Modules/Message/message.controller.js";
import cors from "cors";
import path from "path";
import { testRedisConnection } from "./DB/redis.connection.js";
import helmet from "helmet";

import { ipKeyGenerator, rateLimit } from "express-rate-limit";

import geoip from "geoip-lite";
import * as redisMethods from "./DB/redis.service.js";

async function bootstrap() {
  const app = express();
  const port = SERVER_PORT;

  await testDBConnection();
  await testRedisConnection();

  app.set("trust proxy", true);

  app.use(
    express.json(),
    cors(),
    helmet(),
    rateLimit({
      windowMs: 3 * 60 * 1000,
      limit: (req, res) => {
        const ipInfo = geoip.lookup(req.ip) || {};
        return ipInfo.country == "EG" ? 5 : 0;
      },
      legacyHeaders: false,
      requestPropertyName: "rateLimit",
      keyGenerator: (req, res) => {
        const ip = ipKeyGenerator(req.ip);
        return `${ip}-${req.path}`;
      },
      store: {
        async incr(key, cb) {
          const noReqs = await redisMethods.incr(key);
          if (noReqs == 1) {
            await redisMethods.expire(key, 3 * 60);
          }
          cb(null, noReqs);
        },

        async decrement(key) {
          const isKeyExists = await redisMethods.exists(key);
          if (isKeyExists) {
            await redisMethods.decr(key);
          }
        },
      },
      // skipSuccessfulRequests,
      // skipFailedRequests: true,
    }),
  );

  app.use("/uploads", express.static(path.resolve("./uploads")));

  app.use((req, res, next) => {
    console.log({ "req.rateLimit": req.rateLimit });

    next();
  });
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);

  app.use(globalErrHandling);

  app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
}

export default bootstrap;
