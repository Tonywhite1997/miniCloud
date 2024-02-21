import express from "express";
const authController = require("../controllers/authController");
const fileController = require("../controllers/fileController");

const router = express.Router();

router.use(authController.protected);
router.use(authController.isAccountVerified);

router.get("/files", fileController.getCurrentUserFiles);
router.get("/display/files/:fileID", fileController.getFile);
router.get("/files/:folderID", fileController.getCurrentUserFolderFiles);
router.post("/verify-available-space", fileController.verifyAvailableSpace);
router.post("/rename-file", fileController.renameFile);
router.post(
  "/upload/:folderID?",
  fileController.uploadFile,
  fileController.saveFile
);
router.get("/download/:objectID", fileController.downloadFIle);
router.patch("/move-file/:fileID", fileController.moveFileToFolder);
router.patch("/move-files", fileController.moveMultipleFilesToFolder);
router.delete("/:objectID", fileController.deleteFile);
router.delete(
  "/delete/:folderID?/delete-files",
  fileController.deleteMultipleFiles
);

module.exports = router;
