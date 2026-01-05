import express from "express";
import {
  getAllUser,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import {restrictTo,verfyJWT} from "../middlewares/protect.js";

const router = express.Router();
 router.use(verfyJWT,restrictTo("admin"))

router.route("/").get(getAllUser)
router
  .route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;
