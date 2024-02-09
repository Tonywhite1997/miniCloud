import express from "express";
// import cookieParser from "cookie-parser"
const folderController = require("../controllers/folderController");
const authController = require("../controllers/authController");

const router = express.Router();
// router.use(cookieParser())
router.use(authController.protected);
router.use(authController.isAccountVerified);

router.post("/create-folder", folderController.createFolder);
router.get("/", folderController.getFolders);
router.get("/my-folders", folderController.getMyFolders);
router.delete("/my-folders/:folderId", folderController.deleteFolder);
router.patch("/my-folders/:folderId", folderController.renameFolder);

module.exports = router;
