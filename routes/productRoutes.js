import express from "express";
import { getAllProduct, createProduct,getProduct ,updateProduct,deleteProduct} from "../controllers/productsController.js";

const router = express.Router();

router.route("/").get(getAllProduct).post(createProduct)
router.route("/:id").get(getProduct).patch(updateProduct).delete(deleteProduct)


export default router;
