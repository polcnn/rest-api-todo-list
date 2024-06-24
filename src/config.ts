import * as dotenv from "dotenv";

dotenv.config();

interface IConfigApp {
  port: number;
  redisUrl: string;
}

export const configApp: IConfigApp = {
  port: +process.env.PORT!,
  redisUrl: process.env.REDIS_URL!,
};
