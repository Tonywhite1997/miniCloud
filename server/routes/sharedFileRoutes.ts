const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protected);

const sharedFileController = require("../controllers/sharedFileController");

router.post("/share", sharedFileController.shareFile);
router.get("/files", sharedFileController.getUserSharedFiles);
router.get("/borrowed-files", sharedFileController.getUserBorrowedFiles);
router.get("/file/:fileID", sharedFileController.getFile);
router.post(
  "/file/edit-permissions",
  sharedFileController.editRecipientPermissions
);
router.post("/file/rename", sharedFileController.renameSharedFile);
router.post(
  "/file/revoke-permissions",
  sharedFileController.revokeRecipientAccess
);
router.delete("/file/delete-file", sharedFileController.deleteSharedFile);

module.exports = router;
