import { NextFunction, Request, Response } from "express";
const SharedFile = require("../models/sharedFile");
const User = require("../models/user");
const File = require("../models/file");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const awsActions = require("../aws-s3-service");

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
      link: file.link,
      key: file.key,
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

exports.getFile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fileID } = req.params;
    if (!fileID) return next(new AppError("file ID is required", 401));

    const file = await SharedFile.findById(fileID);

    if (!file) return next(new AppError("invalid file ID", 401));

    res.status(200).json({
      status: "success",
      file,
    });
  }
);

exports.editRecipientPermissions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fileID, canDelete, canRename, canDownload } = req.body.data;
    if (!fileID) return next(new AppError("file ID required", 401));

    const file = await SharedFile.findOne({ _id: fileID, owner: req.user._id });

    if (!file)
      return next(
        new AppError("You do not have permission to execute this command", 401)
      );

    await SharedFile.findOneAndUpdate(
      { _id: fileID },
      { $set: { canDelete, canDownload, canRename } },
      { new: true }
    );

    res.status(200).json({
      message: "success",
    });
  }
);

exports.revokeRecipientAccess = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fileID } = req.body;

    if (!fileID) return next(new AppError("file ID required", 401));

    const file = await SharedFile.findOne({
      _id: fileID,
      $or: [{ owner: req.user._id }, { recipient: req.user._id }],
    });

    if (!file)
      return next(
        new AppError("You do not have permission to execute this command", 401)
      );

    await SharedFile.findOneAndDelete({ _id: fileID });

    res.status(200).json({
      message: "success",
    });
  }
);

exports.deleteSharedFile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fileID } = req.body;

    if (!fileID) return next(new AppError("file ID required", 401));

    const file = await SharedFile.findOne({
      _id: fileID,
      recipient: req.user._id,
    });

    if (!file) return next(new AppError("file not found", 401));

    if (!file.canDelete)
      return next(
        new AppError("You do not have permission to execute this command", 401)
      );

    try {
      const AWSresult = await awsActions.S3DeleteObject(file.key);

      if (!AWSresult) return next(new AppError("Error. Try again later", 500));

      await SharedFile.findOneAndDelete({ _id: fileID });
      await File.findOneAndDelete({ _id: file.fileID });

      res.status(200).json({
        message: "success",
      });
    } catch (error) {
      console.log(error);
      return next(new AppError("An error occured", 500));
    }
  }
);

exports.renameSharedFile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fileID, newFilename } = req.body;

    if (!fileID.trim() && newFilename.trim())
      return next(new AppError("file name required", 401));

    const file = await SharedFile.findOne({
      _id: fileID,
      recipient: req.user._id,
      canRename: true,
    });

    if (!file)
      return next(
        new AppError(
          "file not found or you don't have access to execute this command",
          401
        )
      );

    await SharedFile.findOneAndUpdate(
      { _id: file._id },
      { $set: { name: newFilename } }
    );

    await File.findOneAndUpdate(
      { _id: file.fileID },
      { $set: { fileName: newFilename } }
    );
    res.status(200).json({
      status: "success",
    });
  }
);
