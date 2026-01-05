import express from "express";
import {
  getAllCategory,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { restrictTo, verfyJWT } from "../middlewares/protect.js";

const router = express.Router();

router.route("/").get(getAllCategory);
router.route("/:id").get(getCategory);

router.use(verfyJWT, restrictTo("guide", "lead-guide", "admin"));

router.route("/").post(createCategory);
router.route("/:id").patch(updateCategory).delete(deleteCategory);

export default router;
