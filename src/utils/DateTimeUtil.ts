import moment from "moment";

import { FormatDateTimeConst } from "../constants/AppConstants";

export const currentDateTime = (
  format = FormatDateTimeConst.FULLDATETIME
): string => {
  return moment().format(format);
};
