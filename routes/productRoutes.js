import express from "express";
import {
  getAllProduct,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsController.js";
import { restrictTo, verifyJWT } from "../middlewares/protect.js";
import reviewRouter from "./reviewRouter.js";

const router = express.Router();

router.route("/").get(getAllProduct);
router.route("/:id").get(getProduct);

router.use(verifyJWT);
// POST /product/23151516/reviews
// GET /product/23151516/reviews
// GET /product/23151516/reviews/152561516

router.use("/:productId/reviews",reviewRouter)





router.use( restrictTo( "admin", "moderator"));
router.route("/").post(createProduct);
router.route("/:id").patch(updateProduct).delete(deleteProduct);



export default router;
