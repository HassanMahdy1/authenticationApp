import express from "express";
import {
  getAllBrand,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import { restrictTo, verfyJWT } from "../middlewares/protect.js";

const router = express.Router();

router.route("/").get(getAllBrand);
router.route("/:id").get(getBrand);

router.use(verfyJWT, restrictTo("guide", "lead-guide", "admin"));

router.route("/").post(createBrand);
router.route("/:id").patch(updateBrand).delete(deleteBrand);

export default router;
