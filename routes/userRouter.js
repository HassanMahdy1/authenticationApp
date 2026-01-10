import express from "express";
import {
  getAllUser,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { restrictTo, verifyJWT } from "../middlewares/protect.js";
import { updatePassword } from "../controllers/currentUserController/updatePassword.js";
import { updateMe } from "../controllers/currentUserController/updateMe.js";
import { deleteMe } from "../controllers/currentUserController/deleteMe.js";

const router = express.Router();
router.use(verifyJWT);
router.patch("/updatePassword", updatePassword);
router.patch("/updateMe", updateMe);
router.delete("/deleteMe", deleteMe);

router.use(restrictTo("admin"));
router.route("/").get(getAllUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
