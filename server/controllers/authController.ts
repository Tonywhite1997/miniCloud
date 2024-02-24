import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import JWT, { TokenExpiredError } from "jsonwebtoken";
import dotenv from "dotenv";
const User = require("../models/user");
const File = require("../models/file");
const Folder = require("../models/folder");
const SharedFile = require("../models/sharedFile");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const AWSS3 = require("../aws-s3-service");
import { sendPassResetToEmail } from "../email/forgot-password";
import { changePasswordSuccessEmail } from "../email/passord-change-success";
import { emailVerificationSuccessEmail } from "../email/email-verification-success";
import { welcomeMessage } from "../email/welcome-email";
import { generateCode } from "../utils/generateCode";
import { verifyAccount } from "../email/verify-email";

dotenv.config();

const getJWTToken = (user_id: string): string => {
  const token = JWT.sign({ user_id }, process.env.JWT_SECRET);
  return token;
};

interface cookieType {
  httpOnly: boolean;
  maxAge: number;
  secure: boolean;
  sameSite: "lax" | "none";
}

const cookieOptions: cookieType = {
  httpOnly: process.env.NODE_ENV === "production" ? true : false,
  sameSite: process.env.NODE_ENV === "production" ? "lax" : "none",
  secure: process.env.NODE_ENV === "production" ? true : false,
  maxAge: 1 * 60 * 60 * 1000,
};

interface IUSER {
  _id: string;
}

const sendJWTToken = (user: IUSER, res: Response, statusCode: number) => {
  const token = getJWTToken(user._id);

  res.cookie("miniCloudToken", token, cookieOptions);
  return res.json({
    status: "ok",
    code: statusCode,
    user,
  });
};

exports.register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    if (!name.trim() || !email.trim() || !password.trim())
      return next(new AppError("All fields required", 400));

    const newUser = await User.create({ name, email, password });

    const link =
      process.env.NODE_ENV === "production"
        ? "https://miniycloud.netlify.app/auth/login"
        : "http://localhost:5173/auth/login";

    await welcomeMessage(newUser.email, link, newUser.name);

    res.status(200).json({
      data: newUser,
    });
  }
);

exports.login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new AppError("email and password are required", 400));

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password)))
      return next(new AppError("invalid email or password", 404));
    user.password = undefined;

    sendJWTToken(user, res, 200);
  }
);

exports.verifyEmail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id);

    if (!user) return next(new AppError("login to continue"));

    const verificationCode: string = generateCode();

    const verificationCodeExpiresAt = new Date().setMinutes(
      new Date().getMinutes() + 5
    );

    await User.findOneAndUpdate(
      { email: user.email },
      { $set: { verificationCode, verificationCodeExpiresAt } },
      { new: true }
    );

    try {
      await verifyAccount(user.email, verificationCode);
      res.status(200).json({
        status: "success",
        message: "Verification code sent to email",
      });
    } catch (error) {
      return next(new AppError("something happened.Try again later"));
    }
  }
);

exports.confirmVerificationCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { verificationCode } = req.body;

    if (!verificationCode) return;

    const user = await User.findOne({ verificationCode });

    if (!user) return next(new AppError("Invalid reset code", 401));

    const { verificationCodeExpiresAt } = user;

    const currentDate: Date = new Date();
    const formattedDate: Date = new Date(verificationCodeExpiresAt);
    const isCodeExpired = currentDate > formattedDate;

    if (isCodeExpired) {
      await User.findOneAndUpdate(
        { email: user.email },
        {
          $set: {
            verificationCode: undefined,
            verificationCodeExpiresAt: undefined,
          },
        },
        { new: true }
      );
      return next(new AppError("code expired. try again with new code", 401));
    }

    await User.findOneAndUpdate(
      { email: user.email },
      {
        $set: {
          verificationCode: undefined,
          verificationCodeExpiresAt: undefined,
          isVerified: true,
        },
      },
      { new: true }
    );

    const link =
      process.env.NODE_ENV === "production"
        ? "https://miniycloud.netlify.app/auth/login"
        : "http://localhost:5173/auth/login";

    await emailVerificationSuccessEmail(user.email, link);

    res.status(200).json({
      status: "success",
      message: "Verification code sent to email",
    });
  }
);

declare module "express" {
  interface Request {
    user?: any;
  }
}

interface JWTPayload {
  user_id: string;
  iat: number;
  exp: number;
}

exports.protected = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      token = req.cookies.miniCloudToken;
    }

    if (!token)
      return next(new AppError("Token expired. Please login to continue", 401));

    try {
      const decoded: JWTPayload = JWT.verify(
        token,
        process.env.JWT_SECRET
      ) as JWTPayload;

      const freshUser = await User.findById(decoded.user_id);
      if (!freshUser) return next(new AppError("User does not exist", 404));

      req.user = freshUser;

      next();
    } catch (error) {
      // Handle TokenExpiredError separately
      if (error instanceof TokenExpiredError) {
        return next(new AppError("Token expired. Please log in again.", 401));
      }
      return next(new AppError("Invalid token. Please log in again.", 401));
    }
  }
);

exports.isAccountVerified = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { isVerified } = req.user;

    if (!isVerified)
      return next(new AppError("Verify your account to continue", 401));
    next();
  }
);

const makeTotalSizeConsistence = async (user) => {
  const userFiles = await File.find({ user: user._id });

  const totalSize: number = userFiles.reduce((acc: number, file) => {
    return acc + file.size;
  }, 0);
  if (totalSize !== user.usedSpace) {
    await User.findOneAndUpdate(
      { email: user.email },
      { $set: { usedSpace: totalSize } },
      { new: true }
    );
  }
};

exports.checkIfLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { miniCloudToken } = req.cookies;

  if (!miniCloudToken)
    return next(new AppError("Please login to continue", 402));

  try {
    const decoded: JWTPayload = JWT.verify(
      miniCloudToken,
      process.env.JWT_SECRET
    ) as JWTPayload;

    const user = await User.findById(decoded.user_id);

    if (!user) return next(new AppError("Please login to continue", 402));

    makeTotalSizeConsistence(user);

    res.status(200).json({
      status: "ok",
      user,
    });
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new AppError("Token expired. Please log in again.", 401));
    }

    return next(new AppError("Invalid token. Please log in again.", 401));
  }
};

exports.changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword && !newPassword)
      return next(new AppError("all fields are required", 404));

    const user = await User.findById(req.user._id).select("+password");

    if (!user) return next(new AppError("user with id not found", 404));

    const isCurrentPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordMatch)
      return next(new AppError("your current password is incorrect"));

    user.password = newPassword;
    await user.save();
    user.password = undefined;
    res.status(200).json({
      status: "ok",
      user,
    });
  }
);

exports.forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email)
      return next(new AppError("registered email field required ", 404));
    const user = await User.findOne({ email });

    if (!user) return next(new AppError("enter your registered email", 404));
    const resetCode: string = generateCode();
    const resetCodeExpiresAt = new Date().setMinutes(
      new Date().getMinutes() + 5
    );

    await User.findOneAndUpdate(
      { email: user.email },
      { $set: { resetCode, resetCodeExpiresAt } },
      { new: true }
    );

    try {
      await sendPassResetToEmail(user.email, resetCode);
    } catch (error) {
      return next(new AppError("Something occured. Try agian later", 500));
    }

    res.status(200).json({
      status: "ok",
      msg: "reset code sent to email",
    });
  }
);

exports.resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resetCode, newPassword } = req.body;

    if (!resetCode || !newPassword)
      return next(new AppError("input reset code and new password", 401));

    const user = await User.findOne({ resetCode });

    if (!user) return next(new AppError("Invalid reset code", 401));

    const { resetCodeExpiresAt } = user;

    const currentDate: Date = new Date();
    const formattedDate: Date = new Date(resetCodeExpiresAt);
    const isCodeExpired = currentDate > formattedDate;

    if (isCodeExpired) {
      await User.findOneAndUpdate(
        { email: user.email },
        {
          $set: {
            resetCode: undefined,
            resetCodeExpiresAt: undefined,
          },
        },
        { new: true }
      );
      return next(new AppError("code expired. try again with new code", 401));
    }

    const link =
      process.env.NODE_ENV === "production"
        ? "https://miniycloud.netlify.app/auth/login"
        : "http://localhost:5173/auth/login";

    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpiresAt = undefined;
    await user.save();

    await changePasswordSuccessEmail(user.email, link);

    res.status(200).json({
      message: "password changed successfully",
    });
  }
);

interface FILEBODY {
  fileName: string;
  key: string;
  link: string;
  user: string;
  size: number;
  mimetype: string;
  folder?: string;
}

exports.deleteAccount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;

    if (!password) return next(new AppError("password is required", 402));

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return next(new AppError("login to continue.", 404));

    const isCurrentPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );
    if (!isCurrentPasswordMatch)
      return next(new AppError("enter correct password", 402));

    const files = await File.find({ user: user._id });

    const keys = await Promise.all(
      files.map((file: FILEBODY) => {
        return file.key;
      })
    );
    try {
      //deleting user files from aws s3 bucket
      if (keys.length) {
        const response = await AWSS3.S3DeleteMultipleObjects(keys);

        if (!response.Deleted.length)
          return next(new AppError("An error occured. try again", 500));
      }

      await SharedFile.deleteMany({
        $or: [{ recipient: req.user._id }, { owner: req.user._id }],
      });

      //deletinf user files details from mongodb
      await File.deleteMany({ user: user._id });

      //deleting user folders
      await Folder.deleteMany({ user: user._id });

      //deleting user account
      const deletedAccount = await User.deleteOne({ _id: user._id });

      if (!deletedAccount.deletedCount)
        return next(new AppError("problem deleting account", 404));

      res.status(201).json({
        status: "ok",
      });
    } catch (error) {
      return next(new AppError(`${error.message}`, 404));
    }
  }
);

exports.logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const cookieOptions: cookieType = {
      httpOnly: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "none",
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 100,
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("miniCloudToken", "bye-bye", cookieOptions);
    res.json({
      status: "ok",
      message: "logout successful",
    });
  }
);
