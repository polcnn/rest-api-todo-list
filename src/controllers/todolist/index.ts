import express from "express";

import { default as app } from "./app";

const routes = express.Router();

routes.use("/todolist", app);

export default routes;
