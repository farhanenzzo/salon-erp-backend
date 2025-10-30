import { ERROR_MESSAGES } from "../constants.js";

export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(ERROR_MESSAGES.SOMETHING_WENT_WRONG);
};
