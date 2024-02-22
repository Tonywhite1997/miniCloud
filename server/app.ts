import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
const globalErrorHandler = require("./utils/globalErrorHandler");
const authRoutes = require("./routes/authRoutes");
const folderRoutes = require("./routes/folderRoutes");
const fileRoutes = require("./routes/fileRoutes");
const userRoutes = require("./routes/userRoutes");
const sharedFileRoutes = require("./routes/sharedFileRoutes");
const AppError = require("./utils/appError");
const catchAsync = require("./utils/catchAsync");

const app = express();
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
    // origin: "https://minicloud.onrender.com",
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/folder", folderRoutes);
app.use("/api/file", fileRoutes);
app.use("/api/user", userRoutes);
app.use("/api/share-file", sharedFileRoutes);

app.all(
  "*",
  catchAsync((req: Request, res: Response, next: NextFunction) => {
    const message = `cannot find ${req.originalUrl} on the server`;
    return next(new AppError(message, 404));
  })
);

app.use(globalErrorHandler);

module.exports = app;
