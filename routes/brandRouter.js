import express from "express";
import {
  getAllBrand,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import { restrictTo, verifyJWT } from "../middlewares/protect.js";

const router = express.Router();

router.route("/").get(getAllBrand);
router.route("/:id").get(getBrand);

router.use(verifyJWT, restrictTo( "admin", "moderator"));

router.route("/").post(createBrand);
router.route("/:id").patch(updateBrand).delete(deleteBrand);

export default router;
