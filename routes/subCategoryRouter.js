import express from "express";
import {
  getAllSubCategory,
  createSubCategory,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategoryController.js";

const router = express.Router();

router.route("/").get(getAllSubCategory).post(createSubCategory);
router
  .route("/:id")
  .get(getSubCategory)
  .patch(updateSubCategory)
  .delete(deleteSubCategory);

export default router;
