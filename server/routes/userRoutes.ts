import express from "express";
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();
router.use(authController.protected);

router.patch("/update-used-space", userController.updateUsedSpace);
router.patch("/change-password", authController.changePassword);
router.delete("/delete-account", authController.deleteAccount);

module.exports = router;
