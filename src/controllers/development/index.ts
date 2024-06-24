import express from "express";

import { default as redis } from "./redis";

const routes = express.Router();

routes.use("/development", redis);

export default routes;
