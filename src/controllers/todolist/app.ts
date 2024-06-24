import { Router } from "express";
import type { IRouter, Request, Response } from "express";

import RedisModel from "../../models/RedisModel";

import type { ITodoList, ITodoListForm } from "../../types/todolist";

import {
  SuccessResponse,
  ErrorResponse,
  LogResponse,
} from "../../utils/ResponseUtil";
import { currentDateTime } from "../../utils/DateTimeUtil";

import { StatusCodeConst } from "../../constants/HttpConstants";
import { TodoListKeyConst } from "../../constants/TodoListConstants";

const routes: IRouter = Router();

routes.get("/getAllTodolist", async (req: Request, res: Response) => {
  try {
    const getAllTodolist: ITodoList[] | undefined = await RedisModel.get(
      TodoListKeyConst.LIST_TODO_LIST
    );

    return res.status(StatusCodeConst.SUCCESS.OK).json(
      SuccessResponse("Successfully", {
        list: getAllTodolist || [],
        total: getAllTodolist?.length || 0,
      })
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      LogResponse("❗️ Get All Todo List Error", error);

      return res
        .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse("Get All Todo List Error", error.message));
    }

    return res
      .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse("An unknown error occurred", error));
  }
});

routes.get("/getTodolistById/:id", async (req: Request, res: Response) => {
  try {
    const paramId = req.params.id;

    if (!paramId) {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.BAD_REQUEST)
        .json(ErrorResponse("Please fill out the information completely"));
    }

    const id = Number(paramId);

    const getAllTodolist: ITodoList[] =
      (await RedisModel.get(TodoListKeyConst.LIST_TODO_LIST)) || [];
    const todoList: ITodoList | undefined = getAllTodolist.find(
      (item) => item.id === id
    );

    if (!todoList) {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.NOT_FOUND)
        .json(ErrorResponse("No information found"));
    }

    return res
      .status(StatusCodeConst.SUCCESS.OK)
      .json(SuccessResponse("Successfully", todoList));
  } catch (error: unknown) {
    if (error instanceof Error) {
      LogResponse("❗️ Get Todo List By ID Error", error);

      return res
        .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse("Get Todo List By ID Error", error.message));
    }

    return res
      .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse("An unknown error occurred", error));
  }
});

routes.post("/add", async (req: Request, res: Response) => {
  try {
    const { value }: ITodoListForm = req.body;

    if (!value || value.trim() === "") {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.BAD_REQUEST)
        .json(ErrorResponse("Please fill out the information completely"));
    }

    const newItem: ITodoList = {
      id: 0,
      value,
      createdAt: currentDateTime(),
      updatedAt: currentDateTime(),
    };

    const getAllTodolist: ITodoList[] =
      (await RedisModel.get(TodoListKeyConst.LIST_TODO_LIST)) || [];
    const isDuplicate = getAllTodolist.some(
      (item: ITodoList) => item.value === value
    );

    if (isDuplicate) {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.CONFLICT)
        .json(ErrorResponse("Todolist Duplicate"));
    }

    const getLastId: number = getAllTodolist.length
      ? getAllTodolist[getAllTodolist.length - 1].id
      : 0;
    newItem.id = getLastId + 1;

    const newTodolist = [...getAllTodolist, newItem];
    const result = await RedisModel.set(
      TodoListKeyConst.LIST_TODO_LIST,
      newTodolist
    );

    if (result) {
      return res
        .status(StatusCodeConst.SUCCESS.CREATED)
        .json(SuccessResponse("Successfully", newItem));
    } else {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.BAD_REQUEST)
        .json(ErrorResponse("Unable to add information, Please try again"));
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      LogResponse("❗️ Add New Todo List Error", error);

      return res
        .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse("Add New Todo List Error", error.message));
    }

    return res
      .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse("An unknown error occurred", error));
  }
});

routes.patch("/updateById/:id", async (req: Request, res: Response) => {
  try {
    const paramId = req.params.id;
    const { value }: ITodoListForm = req.body;

    if (!paramId || !value) {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.BAD_REQUEST)
        .json(ErrorResponse("Please fill out the information completely"));
    }

    const id = Number(paramId);

    const getAllTodolist: ITodoList[] =
      (await RedisModel.get(TodoListKeyConst.LIST_TODO_LIST)) || [];
    const todoListIndex = getAllTodolist.findIndex((item) => item.id === id);

    if (todoListIndex === -1) {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.NOT_FOUND)
        .json(ErrorResponse("No information found"));
    }

    const oldTodolistValue: string = getAllTodolist[todoListIndex].value;

    getAllTodolist[todoListIndex].value = value;

    if (value !== oldTodolistValue) {
      getAllTodolist[todoListIndex].updatedAt = currentDateTime();
    }

    const result = await RedisModel.set(
      TodoListKeyConst.LIST_TODO_LIST,
      getAllTodolist
    );

    if (result) {
      return res
        .status(StatusCodeConst.SUCCESS.OK)
        .json(SuccessResponse("Successfully"));
    } else {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.BAD_REQUEST)
        .json(ErrorResponse("Unable to update data, Please try again"));
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      LogResponse("❗️ Update Todo List Error", error);

      return res
        .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse("Update Todo List Error", error.message));
    }

    return res
      .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse("An unknown error occurred", error));
  }
});

routes.delete("/removeById/:id", async (req: Request, res: Response) => {
  try {
    const paramId = req.params.id;

    if (!paramId || paramId.trim() === "") {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.BAD_REQUEST)
        .json(ErrorResponse("Please fill out the information completely"));
    }

    const id = Number(paramId);

    const getAllTodolist: ITodoList[] =
      (await RedisModel.get(TodoListKeyConst.LIST_TODO_LIST)) || [];
    const todoListIndex = getAllTodolist.findIndex((item) => item.id === id);

    if (todoListIndex === -1) {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.NOT_FOUND)
        .json(ErrorResponse("No information found"));
    }

    const newTodolist = getAllTodolist.filter((item) => item.id !== id);
    const result = await RedisModel.set(
      TodoListKeyConst.LIST_TODO_LIST,
      newTodolist
    );

    if (result) {
      return res
        .status(StatusCodeConst.SUCCESS.OK)
        .json(SuccessResponse("Successfully"));
    } else {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.BAD_REQUEST)
        .json(ErrorResponse("Unable to delete data, Please try again"));
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      LogResponse("❗️ Remove Todo List Error", error);
      return res
        .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse("Remove Todo List Error", error.message));
    }

    return res
      .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse("An unknown error occurred", error));
  }
});

routes.delete("/removeAll", async (req: Request, res: Response) => {
  try {
    const result = await RedisModel.set(TodoListKeyConst.LIST_TODO_LIST, []);

    if (result) {
      return res
        .status(StatusCodeConst.SUCCESS.OK)
        .json(SuccessResponse("Successfully"));
    } else {
      return res
        .status(StatusCodeConst.CLIENT_ERROR.BAD_REQUEST)
        .json(ErrorResponse("Unable to delete data, Please try again"));
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      LogResponse("❗️ Remove All Todo List Error", error);

      return res
        .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
        .json(ErrorResponse("Remove All Todo List Error", error.message));
    }

    return res
      .status(StatusCodeConst.ERROR.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse("An unknown error occurred", error));
  }
});

export default routes;
