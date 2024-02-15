import { NextFunction, Request, Response } from "express";
const SharedFile = require("../models/sharedFile");
const User = require("../models/user");
const File = require("../models/file");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.shareFile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const {recipientEmail, delete, rename,download, fileID} = req.body
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
      owner: req.user._id,
    };

    try {
      await SharedFile.create(sharedFileObj);
    } catch (error) {
      return next(new AppError(error.message, 500));
    }

    const sharedFiles = await SharedFile.find({ owner: req.user._id });
    res.json({
      message: "success",
      sharedFiles,
    });
  }
);
