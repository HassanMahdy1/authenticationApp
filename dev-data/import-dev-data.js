import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Category from "../models/categoryModel.js";
import Product from "../models/productsModel.js";

/* ===============================
   Fix __dirname in ES Modules
================================ */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===============================
   Load Environment Variables
================================ */
dotenv.config({ path: path.join(__dirname, "../.env") });

/* ===============================
   DB Connection
================================ */
const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });

/* ===============================
   IMPORT DATA INTO DB
================================ */
const importData = async () => {
  try {
    // قراءة الملفات فقط أثناء الاستيراد
    const category = JSON.parse(
      fs.readFileSync(`${__dirname}/category.json`, "utf-8")
    );

    const products = JSON.parse(
      fs.readFileSync(`${__dirname}/product.json`, "utf-8")
    );

    // إنشاء Category أولًا
    const createdCategory = await Category.create(category);

    // ربط كل منتج بـ Category ObjectId الصحيح
    const productsWithCategory = products.map((p, index) => {
      // استخدام index % عدد الـ Category لتوزيع المنتجات على الفئات
      p.category = createdCategory[index % createdCategory.length]._id;
      return p;
    });

    // إنشاء المنتجات
    await Product.create(productsWithCategory);

    console.log("Data successfully loaded!");
  } catch (err) {
    console.error("Import error:", err);
  }
  process.exit();
};

/* ===============================
   DELETE ALL DATA FROM DB
================================ */
const deleteData = async () => {
  try {
    await Category.deleteMany();
    await Product.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.error("Delete error:", err);
  }
  process.exit();
};

/* ===============================
   CLI Commands
================================ */
if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
