import express from "express";
import productRouter from "./productRoutes.js";
import categoryRouter from "./categoryRouter.js";
import brandRouter from "./brandRouter.js";
import subCategoryRouter from "./subCategoryRouter.js";
import userRouter from "./userRouter.js";
import authRouter from "./authRouter.js";

const router = express.Router();

// Base route
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to E-commerce API",
    version: "1.0.0",
  });
});

// Mount Routers
router.use("/products", productRouter);
router.use("/category", categoryRouter);
router.use("/brand", brandRouter);
router.use("/subCategory", subCategoryRouter);
router.use("/user", userRouter);
router.use("/auth", authRouter);
export default router;
