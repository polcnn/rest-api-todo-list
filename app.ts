import express from "express";
import type {
  Application,
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

import cors from "cors";

import * as dotenv from "dotenv";

import { configApp } from "./src/config";

import RedisModel from "./src/models/RedisModel";

import {
  SuccessResponse,
  ErrorResponse,
  LogResponse,
} from "./src/utils/ResponseUtil";
import { currentDateTime } from "./src/utils/DateTimeUtil";

import { StatusCodeConst } from "./src/constants/HttpConstants";

import { default as controllers } from "./src/controllers";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app: Application = express();

const PORT: number = configApp.port;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins: string[] = ["http://localhost:*"];
  const origin: any = req.headers.origin;

  if ([...allowedOrigins].includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  next();
});

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof Error) {
    LogResponse("❗️ Error Handler", error);

    return res
      .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse(error.message));
  }

  next();
};

app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  return res
    .status(StatusCodeConst.SUCCESS.OK)
    .json(SuccessResponse("Service Connected Successfully"));
});

app.use("/api", controllers);

app.listen(PORT, async () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
  console.log(`⏱️  Connected time: ${currentDateTime()}`);

  await RedisModel.connect();
});
