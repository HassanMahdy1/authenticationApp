import express from "express";
import {
  getAllCategory,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

router.route("/").get(getAllCategory).post(createCategory);
router
  .route("/:id")
  .get(getCategory)
  .patch(updateCategory)
  .delete(deleteCategory);

export default router;
