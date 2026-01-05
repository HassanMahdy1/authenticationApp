import express from "express";
import {
  getAllBrand,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";

const router = express.Router();

router.route("/").get(getAllBrand).post(createBrand);
router
  .route("/:id")
  .get(getBrand)
  .patch(updateBrand)
  .delete(deleteBrand);

export default router;
