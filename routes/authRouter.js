import express from "express";

import { forgotPassword } from './../controllers/resetPassword/forgotPassword.js';
import { resetPassword } from './../controllers/resetPassword/resetPassword.js';
import { authLimiter } from '../middlewares/resetLimiterRequest.js';
import { register } from "../controllers/authController/registerController.js";
import { login } from "../controllers/authController/loginController.js";
import { logout } from "../controllers/authController/logout.js";
import { refreshToken } from "../utils/jwt.js";

const router = express.Router();
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/refresh").get(refreshToken);
router.route("/logout").post(logout);
router.post("/forgotPassword",authLimiter, forgotPassword);
router.patch('/resetPassword/:token', resetPassword);


export default router;
