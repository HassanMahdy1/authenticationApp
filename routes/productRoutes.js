import express from "express";
import {
  getAllProduct,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController.js";
import { restrictTo, verifyJWT } from "../middlewares/protect.js";

const router = express.Router();

router.route("/").get(getAllProduct);
router.route("/:id").get(getProduct);

router.use(verifyJWT, restrictTo("guide", "lead-guide", "admin"));

router.route("/").post(createProduct);
router.route("/:id").patch(updateProduct).delete(deleteProduct);

export default router;
