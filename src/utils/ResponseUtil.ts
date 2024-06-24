import { ResponseStatusConst } from "../constants/AppConstants";

export const SuccessResponse = (
  message: string = "Successfully",
  data: any = undefined
) => {
  if (data) {
    return { status: ResponseStatusConst.SUCCESS, message, data };
  }

  return { status: ResponseStatusConst.SUCCESS, message };
};

export const ErrorResponse = (
  message: string = "Failed",
  details: any = undefined
) => {
  return { status: ResponseStatusConst.FAIL, message, details };
};

export const LogResponse = (
  topic: string,
  data: any | undefined = undefined
) => {
  console.log("================================");
  console.log(topic);

  if (data) {
    console.log(data);
  }

  console.log("================================");
};
