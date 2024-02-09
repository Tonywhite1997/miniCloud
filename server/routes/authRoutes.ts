import express from "express";
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get(
  "/send-email-verification",
  authController.protected,
  authController.verifyEmail
);
router.post(
  "/confirm-verification-code",
  authController.protected,
  authController.confirmVerificationCode
);
router.get("/logout", authController.logout);
router.get("/check-if-login", authController.checkIfLogin);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
