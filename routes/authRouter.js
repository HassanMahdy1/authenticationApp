import express from "express";

import { forgotPassword } from './../controllers/resetPassword/forgotPassword.js';
import { resetPassword } from './../controllers/resetPassword/resetPassword.js';
import { authLimiter } from '../middlewares/resetLimiterRequest.js';
import { register } from "../controllers/authController/registerController.js";
import { login } from "../controllers/authController/loginController.js";
import { logout } from "../controllers/authController/logout.js";
import { refreshTokenController } from './../controllers/authController/refreshTokenController.js';

const router = express.Router();
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/refresh").get(refreshTokenController);
router.route("/logout").post(logout);
router.route("/forgotPassword").post(authLimiter,forgotPassword);
router.route("/resetPassword/:token").patch(resetPassword);



export default router;
