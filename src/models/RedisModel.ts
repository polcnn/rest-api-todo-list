import { createClient } from "redis";

import { configApp } from "../config";

import { LogResponse } from "../utils/ResponseUtil";
import { currentDateTime } from "../utils/DateTimeUtil";

const redisClient = createClient({ url: configApp.redisUrl }).on(
  "error",
  (error) => {
    LogResponse("❗️ Connection to Redis Failed", error);
  }
);

export default class RedisModel {
  static async connect() {
    try {
      await redisClient.connect();

      console.log(`🚀 Redis is running at ${configApp.redisUrl}`);
      console.log(`⏱️  Connected time: ${currentDateTime()}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        LogResponse("❗️ Connection to Redis Error", error);
      }
    }
  }

  static async get(key: string) {
    try {
      const result: any = await redisClient.get(key);

      if (result) {
        return JSON.parse(result);
      }

      return undefined;
    } catch (error: unknown) {
      if (error instanceof Error) {
        LogResponse(`❗️ Redis Get Key ${key} Error`, error);
        throw new Error(error.message);
      }
    }
  }

  static async set(key: string, value: any) {
    try {
      const result: any = await redisClient.set(key, JSON.stringify(value));

      if (result === "OK") {
        return true;
      }

      throw new Error(result);
    } catch (error: unknown) {
      if (error instanceof Error) {
        LogResponse(`❗️ Redis Set Key ${key} Error`, error);
        throw new Error(error.message);
      }
    }
  }

  static async del(key: string) {
    try {
      const result: any = await redisClient.del(key);

      if (result === 1) {
        return true;
      }

      throw new Error("The key was not found in the system");
    } catch (error: unknown) {
      if (error instanceof Error) {
        LogResponse(`❗️ Redis Delete Key "${key}" Error`, error);
        throw new Error(error.message);
      }
    }
  }
}
