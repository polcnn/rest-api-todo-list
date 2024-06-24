import express from "express";

import { default as todolist } from "./todolist";
import { default as development } from "./development";

const routes = express.Router();

routes.use(todolist);
routes.use(development);

export default routes;
