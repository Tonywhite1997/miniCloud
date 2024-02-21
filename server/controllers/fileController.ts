import { NextFunction, Request, Response } from "express";
import multer from "multer";
const awsActions = require("../aws-s3-service");
const User = require("../models/user");
const File = require("../models/file");
const Folder = require("../models/folder");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.verifyAvailableSpace = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user._id);
    const { allocatedSpace, usedSpace } = user;
    const { fileSize } = req.body;

    if (!fileSize) return next(new AppError("select a file", 401));
    console.log(fileSize);

    const currentUsedSpace: number = usedSpace + fileSize;

    if (currentUsedSpace > allocatedSpace)
      return next(new AppError("File size exceeded available space", 401));

    res.json({
      status: "ok",
      message: "good to go",
    });
  }
);

const storage = multer.memoryStorage();

const upload = multer({ storage });

exports.uploadFile = upload.single("file");

interface FILEBODY {
  fileName: string;
  key: string;
  link: string;
  user: string;
  size: number;
  mimetype: string;
  folder?: string;
}

exports.saveFile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { folderID } = req.params;
    if (folderID) {
      const folder = await Folder.findById(folderID);
      if (!folder) return next(new AppError("folder not found", 404));
    }

    let S3UploadSuccessfully: boolean = false;
    let S3ObjectKey: string = "";

    try {
      const AWSresult = await awsActions.S3Upload(req.file);

      if (!AWSresult.Key) return next(new AppError("Error: Try again", 500));

      const { Location, Key: objectKey } = AWSresult;
      S3UploadSuccessfully = true;
      S3ObjectKey = objectKey;

      const fileBody: FILEBODY = {
        fileName: req.file.originalname,
        key: objectKey,
        link: Location,
        user: req.user._id,
        size: req.file.size,
        mimetype: req.file.mimetype,
      };

      if (folderID) {
        fileBody.folder = folderID;
      }

      await File.create(fileBody);

      let files: FILEBODY;
      if (folderID) {
        files = await File.find({ folder: folderID, user: req.user._id });
      } else {
        files = await File.find({ folder: null, user: req.user._id });
      }

      res.json({
        status: "ok",
        files,
      });
    } catch (error) {
      if (S3UploadSuccessfully) {
        await awsActions.S3DeleteObject(S3ObjectKey);
        return next(new AppError("Error: Try again later", 500));
      }
    }
  }
);

exports.renameFile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { newFileName, id } = req.body.fileData;

    if (!newFileName || !id)
      return next(new AppError("file id and new filename required", 401));

    const newNameWithoutExt = newFileName.split(".").slice(0, 1).join(".");

    if (!newNameWithoutExt.trim())
      return next(new AppError("new filename is required", 401));

    const file = await File.findById(id);

    if (!file) return next(new AppError("file not found", 400));

    await File.findOneAndUpdate(
      { _id: file._id },
      { $set: { fileName: newFileName } },
      { new: true }
    );

    let newFiles;

    if (file.folder) {
      newFiles = await File.find({ user: file.user, folder: file.folder });
    } else {
      newFiles = await File.find({ user: file.user });
    }

    res.status(200).json({
      status: "ok",
      message: "name changed successfully",
      files: newFiles,
    });
  }
);

exports.downloadFIle = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { objectID } = req.params;
    try {
      const file = await File.findById(objectID);

      if (!file) return next(new AppError("file not found.", 404));

      const result = await awsActions.S3Download(file.key);

      if (!result) return next(new AppError("Error: Try again", 500));

      res.setHeader("Content-Type", file.mimetype);
      res.setHeader("Transfer-Encoding", "chunked");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${file.fileName}`
      );

      result.pipe(res);
    } catch (error) {
      next(new AppError("error downloading your file", 500));
    }
  }
);

exports.moveFileToFolder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fileID } = req.params;
    const { currentFolderID, targetFolderID } = req.query;

    if (!fileID)
      return next(
        new AppError("Please select a folder and a file to continue", 404)
      );

    const file = await File.findById(fileID);

    if (!file) return next(new AppError("file not found", 404));

    let files: FILEBODY;

    if (!targetFolderID) {
      await File.updateOne(
        { _id: fileID },
        { $set: { folder: null } },
        { new: true }
      );
    } else {
      await File.updateOne(
        { _id: fileID },
        { $set: { folder: targetFolderID } },
        { new: true }
      );
    }

    if (file.folder) {
      files = await File.find({ folder: file.folder, user: req.user._id });
    } else {
      files = await File.find({ folder: null, user: req.user._id });
    }

    res.status(200).json({
      status: "ok",
      files,
    });
  }
);

exports.moveMultipleFilesToFolder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentFolderID, targetFolderID } = req.query;
    const { fileIDs } = req.body;

    const moveFilePromises = fileIDs.map(async (id: string) => {
      if (targetFolderID) {
        return File.findOneAndUpdate(
          { _id: id, user: req.user._id },
          { $set: { folder: targetFolderID } }
        );
      } else {
        return File.findOneAndUpdate(
          { _id: id, user: req.user._id },
          { $set: { folder: null } }
        );
      }
    });

    // Wait for all promises to complete
    await Promise.all(moveFilePromises);

    let files: FILEBODY;
    if (currentFolderID) {
      files = await File.find({ folder: currentFolderID, user: req.user._id });
    } else {
      files = await File.find({ folder: null, user: req.user._id });
    }

    res.status(201).json({
      status: "ok",
      files,
    });
  }
);

exports.deleteFile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { objectID } = req.params;
    const { folderID } = req.body;

    const file = await File.findById(objectID);
    if (!file) return next(new AppError("file not found", 404));

    const AWSresult = await awsActions.S3DeleteObject(file.key);

    if (!AWSresult) return next(new AppError("Error. Try again later", 500));

    await File.deleteOne({ _id: file._id });

    let files: FILEBODY;

    if (folderID) {
      files = await File.find({ folder: folderID, user: req.user._id });
    } else {
      files = await File.find({ folder: null, user: req.user._id });
    }

    res.status(201).json({
      status: "ok",
      files,
    });
  }
);

exports.deleteMultipleFiles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { folderID } = req.params;
    const { fileIDs } = req.body;

    const keys = await Promise.all(
      fileIDs.map(async (id: string) => {
        const file = await File.findById(id);
        return file.key;
      })
    );

    try {
      const response = await awsActions.S3DeleteMultipleObjects(keys);

      if (!response.Deleted.length)
        return next(new AppError("An error occured", 500));

      await Promise.all(
        fileIDs.map(async (id: string) => {
          return await File.findByIdAndDelete(id);
        })
      );

      let files: FILEBODY;
      if (folderID) {
        files = await File.find({ folder: folderID, user: req.user._id });
      } else {
        files = await File.find({ folder: null, user: req.user._id });
      }

      res.status(201).json({
        status: "ok",
        files,
      });
    } catch (error) {
      return next(new AppError("An error occured. Try again", 404));
    }
  }
);

exports.getCurrentUserFiles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const files = await File.find({ user: req.user._id });
    res.status(200).json({
      status: "ok",
      files,
    });
  }
);

exports.getFile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { fileID } = req.params;

    const file = await File.findById(fileID);

    if (!file) return next(new AppError("invalid file ID", 401));

    res.status(200).json({
      status: "success",
      file,
    });
  }
);

exports.getCurrentUserFolderFiles = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { folderID } = req.params;
    const files = await File.find({ user: req.user._id, folder: folderID });

    res.status(200).json({
      status: "ok",
      files,
    });
  }
);
