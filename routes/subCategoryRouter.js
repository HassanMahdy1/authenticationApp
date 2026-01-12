import express from "express";
import {
  getAllSubCategory,
  createSubCategory,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategoryController.js";
import {restrictTo, verifyJWT} from "../middlewares/protect.js";

const router = express.Router();

router.route("/").get(getAllSubCategory);
router.route("/:id").get(getSubCategory);

 router.use(verifyJWT, restrictTo( "admin", "moderator"))

router.route("/").post(createSubCategory);
router.route("/:id").patch(updateSubCategory).delete(deleteSubCategory);

export default router;
