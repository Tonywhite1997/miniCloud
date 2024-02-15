import { NextFunction, Request, Response } from "express";
const SharedFile = require("../models/sharedFile");
const User = require("../models/user");
const File = require("../models/file");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.shareFile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      canDelete,
      canRename,
      canDownload,
      fileID,
      filename,
      recipientEmail,
    } = req.body.dataPayload;

    if (!recipientEmail.trim())
      return next(new AppError("A recipient email is required", 401));

    if (!fileID.trim()) return next(new AppError("fileID not found", 404));

    if (recipientEmail === req.user.email)
      return next(new AppError("You can't share files with yourself", 401));

    const file = await File.findOne({ _id: fileID });

    if (!file) return next(new AppError("invalid file id", 404));

    const recipient = await User.findOne({ email: recipientEmail });

    if (!recipient) return next(new AppError("invalid email address", 404));

    const userAlreadyHasFile = await SharedFile.findOne({
      recipient: recipient._id,
      fileID,
    });

    if (userAlreadyHasFile)
      return next(new AppError("user already have access to this file", 401));

    if (!recipient.isVerified)
      return next(
        new AppError("recipient's email has not been validated", 401)
      );

    const sharedFileObj = {
      canDelete,
      canRename,
      canDownload,
      fileID: fileID,
      name: filename,
      recipient: recipient._id,
      recipientEmail,
      owner: req.user._id,
      ownerEmail: req.user.email,
    };

    try {
      await SharedFile.create(sharedFileObj);
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
    res.json({
      message: "success",
    });
  }
);

exports.getUserSharedFiles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sharedFilesData = await SharedFile.find({ owner: req.user._id });

    interface FILE {
      recipientEmail: string;
      _id: string;
      name: string;
    }

    let sharedFiles = [];

    sharedFilesData.forEach((file: FILE) => {
      sharedFiles.push({
        recipientEmail: file.recipientEmail,
        id: file._id,
        name: file.name,
      });
    });

    res.status(200).json({
      message: "success",
      sharedFiles,
    });
  }
);

exports.getUserBorrowedFiles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const borrowedFilesData = await SharedFile.find({
      recipient: req.user._id,
    });

    interface FILE {
      ownerEmail: string;
      _id: string;
      name: string;
    }

    let borrowedFiles = [];

    borrowedFilesData.forEach((file: FILE) => {
      borrowedFiles.push({
        ownerEmail: file.ownerEmail,
        id: file._id,
        name: file.name,
      });
    });

    res.status(200).json({
      message: "success",
      borrowedFiles,
    });
  }
);
