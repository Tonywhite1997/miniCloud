const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protected);

const sharedFileController = require("../controllers/sharedFileController");

router.post("/share", sharedFileController.shareFile);
router.get("/files", sharedFileController.getUserSharedFiles);
router.get("/borrowed-files", sharedFileController.getUserBorrowedFiles);

module.exports = router;
