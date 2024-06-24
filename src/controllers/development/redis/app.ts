import { Router } from "express";
import type { IRouter, Request, Response } from "express";

import RedisModel from "../../../models/RedisModel";

import {
  SuccessResponse,
  ErrorResponse,
  LogResponse,
} from "../../../utils/ResponseUtil";

import { StatusCodeConst } from "../../../constants/HttpConstants";

const routes: IRouter = Router();

routes.post("/removeKey", async (req: Request, res: Response) => {
  try {
    const { key } = req.body;

    if (!key || key.trim() === "") {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.BAD_REQUEST)
        .json(ErrorResponse("Please fill out the information completely"));
    }

    const result = await RedisModel.del(key);

    if (result) {
      return res
        .status(StatusCodeConst.SUCCESS.OK)
        .json(SuccessResponse(`Remove key ${key} successfully`));
    } else {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.BAD_REQUEST)
        .json(ErrorResponse("Unable to remove data, Please try again"));
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      LogResponse("❗️ Remove Key Error", error);

      return res
        .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse("Remove Key Error", error.message));
    }

    return res
      .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse("An unknown error occurred", error));
  }
});

export default routes;
