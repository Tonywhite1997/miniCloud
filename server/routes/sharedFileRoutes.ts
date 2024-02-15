const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protected);

const sharedFileController = require("../controllers/shredFileController");

router.post("/share", sharedFileController.shareFile);

module.exports = router;
