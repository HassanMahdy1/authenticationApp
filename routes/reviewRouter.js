import express from "express";
import {
  getAllReview,
  createReview,
  getReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { verifyJWT } from "../middlewares/protect.js";

const router = express.Router({mergeParams:true});

router.route("/").get(getAllReview);
router.route("/:id").get(getReview);
  
router.use(verifyJWT);

router.route("/").post(createReview);
router.route("/:id").patch(updateReview).delete(deleteReview);

export default router;
