import { ErrorRequestHandler, NextFunction, Response } from "express";
require("dotenv").config({ origin: "./.env" });
const AppError = require("../utils/appError");

const handleDuplicateError = (error) => {
  const value = error.keyValue.email;
  const message = `${value} is already taken.`;
  return new AppError(message, 400);
};

const sendDevError = (err: any, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    code: err.code,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendProdError = (err: any, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    code: err.code,
    message: err.message,
  });
};

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.statusCode === 500)
    return next(new AppError("An error occured", 500));

  if (process.env.NODE_ENV === "development") {
    return sendDevError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };

    if (err.code === 11000) {
      error = handleDuplicateError(error);
    }

    return sendProdError(error, res);
  }
};

module.exports = globalErrorHandler;
