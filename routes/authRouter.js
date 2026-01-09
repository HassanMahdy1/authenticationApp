import express from "express";
import {
  register,
  login,
  refresh,
  logout,
} from "../controllers/authController.js";
import { forgotPassword } from './../controllers/resetPassword/forgotPassword.js';
import { resetPassword } from './../controllers/resetPassword/resetPassword.js';
import { authLimiter } from '../middlewares/resetLimiterRequest.js';

const router = express.Router();
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/refresh").get(refresh);
router.route("/logout").post(logout);
router.post("/forgotPassword",authLimiter, forgotPassword);
router.patch('/resetPassword/:token', resetPassword);


export default router;
