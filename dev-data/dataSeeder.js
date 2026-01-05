import mongoose from "mongoose";
import slugify from "slugify";
import Category from "../models/categoryModel.js";
import SubCategory from "../models/subCategoryModel.js";
import Brand from "../models/brandModel.js";
import Product from "../models/productsModel.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });
// -------------------- CATEGORIES --------------------
const categoriesData = [
  "البقالة",
  "المشروبات",
  "الأغذية الطازجة",
  "الجمال والعناية",
  "إلكترونيات",
  "أجهزة منزلية",
  "مستلزمات نظافة",
  "حلويات",
  "ألبان",
  "مخبوزات",
];

// -------------------- SUBCATEGORIES --------------------
const subCategoriesMap = {
  البقالة: ["بقوليات", "مكرونة", "أرز", "عسل"],
  المشروبات: ["عصائر", "قهوة", "شاي"],
  "الأغذية الطازجة": ["لحوم", "خضروات"],
  "الجمال والعناية": ["عناية بالبشرة", "شعر"],
  إلكترونيات: ["موبايلات", "تلفزيونات"],
};

// -------------------- BRANDS --------------------
const brandsData = Array.from({ length: 40 }).map((_, i) => ({
  name: `Brand ${i + 1}`,
  logo: `https://dummyimage.com/200x100/000/fff&text=Brand+${i + 1}`,
}));

async function seedDB() {
  try {
    await Category.deleteMany();
    await SubCategory.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();

    // ---- insert categories
    const categories = await Category.insertMany(
      categoriesData.map((name) => ({
        name,
        slug: slugify(name, { lower: true }),
        image: "https://dummyimage.com/600x300",
      }))
    );

    // ---- insert subcategories
    const subCategories = [];
    for (const cat of categories) {
      if (subCategoriesMap[cat.name]) {
        for (const sub of subCategoriesMap[cat.name]) {
          subCategories.push({
            name: sub,
            slug: slugify(sub, { lower: true }),
            category: cat._id,
          });
        }
      }
    }

    const savedSubCategories = await SubCategory.insertMany(subCategories);

    // ---- insert brands
    const brands = await Brand.insertMany(brandsData);

    // ---- insert products
    const products = Array.from({ length: 70 }).map((_, i) => ({
      name: `منتج رقم ${i + 1}`,
      description: "وصف تجريبي للمنتج",
      price: Math.floor(Math.random() * 500) + 50,
      discount: Math.floor(Math.random() * 30),
      stock: Math.floor(Math.random() * 100),
      images: [`https://dummyimage.com/400x400/eee/000&text=Product+${i + 1}`],
      size: "900 جرام",
      ratingsAverage: +(Math.random() * 5).toFixed(1),
      ratingsQuantity: Math.floor(Math.random() * 100),
      category: categories[i % categories.length]._id,
      subCategory: savedSubCategories[i % savedSubCategories.length]._id,
      brand: brands[i % brands.length]._id,
      isAvailable: true,
    }));

    await Product.insertMany(products);

    console.log("Database seeded successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedDB();
