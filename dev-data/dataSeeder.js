/* eslint-disable no-undef */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";

// Models (تأكد المسارات صحيحة)
import Category from "../models/categoryModel.js";
import SubCategory from "../models/subCategoryModel.js";
import Brand from "../models/brandModel.js";
import Product from "../models/productsModel.js";
import User from "../models/userModel.js";
import Review from "../models/reviewModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

// helper لإنشاء slug لأن insertMany يتخطّى pre('save')
const createSlug = (text) =>
  slugify(String(text || ""), { lower: true, strict: true, locale: "ar" });

// اتصال
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("✅ Database connected"))
  .catch((err) => {
    console.error("❌ DB connection error:", err);
    process.exit(1);
  });

/* ======= بيانات جاهزة ======= */

const categoriesData = [
  {
    name: "Electronics",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
  },
  {
    name: "Fashion",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b830c6050?w=800&q=80",
  },
  {
    name: "Beauty",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
  },
  {
    name: "Home & Kitchen",
    image:
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80",
  },
];

const subCatsMap = {
  Electronics: [
    "Smartphones",
    "Laptops",
    "Smart Watches",
    "Headphones",
    "Gaming Consoles",
    "Cameras",
  ],
  Fashion: ["Sneakers", "T-Shirts", "Hoodies", "Jeans", "Watches", "Sunglasses"],
  Beauty: ["Perfumes", "Skincare", "Makeup", "Haircare"],
  "Home & Kitchen": [
    "Coffee Machines",
    "Air Fryers",
    "Blenders",
    "Smart Lighting",
    "Furniture",
  ],
};

const brandsData = [
  { name: "Apple", cat: "Electronics" },
  { name: "Samsung", cat: "Electronics" },
  { name: "Sony", cat: "Electronics" },
  { name: "HP", cat: "Electronics" },
  { name: "Adidas", cat: "Fashion" },
  { name: "Nike", cat: "Fashion" },
  { name: "Zara", cat: "Fashion" },
  { name: "Chanel", cat: "Beauty" },
  { name: "L'Oreal", cat: "Beauty" },
  { name: "Ikea", cat: "Home & Kitchen" },
  { name: "Philips", cat: "Home & Kitchen" },
];

const productAdjectives = [
  "Pro Max",
  "Ultra",
  "Elite",
  "Series 7",
  "Classic",
  "Premium",
  "Wireless",
  "NextGen",
];

/* ======= وظائف Seeder ======= */

const destroyData = async () => {
  try {
    console.log("⏳ Deleting all data...");
    await Promise.all([
      Review.deleteMany(),
      Product.deleteMany(),
      Brand.deleteMany(),
      SubCategory.deleteMany(),
      Category.deleteMany(),
      User.deleteMany(),
    ]);
    console.log("✅ All data deleted");
    process.exit();
  } catch (err) {
    console.error("❌ Delete failed:", err);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    console.log("⏳ Starting seeding...");

    // 1) مسح قديم
    await Promise.all([
      Review.deleteMany(),
      Product.deleteMany(),
      Brand.deleteMany(),
      SubCategory.deleteMany(),
      Category.deleteMany(),
      User.deleteMany(),
    ]);

    // 2) إنشاء Admin (باستخدام create -> يعمل pre('save') لتشفير الباسورد)
    console.log("👤 Creating admin user...");
    const admin = await User.create({
      name: "Super Admin",
      email: "admin@store.com",
      password: "password123",
      passwordConfirm: "password123",
      role: "admin",
    });
    const adminId = admin._id;

    // 3) Categories (لاستخدم insertMany مع slug مُولد يدوياً لأن pre('save') لن تعمل)
    console.log("📂 Creating categories...");
    const categoriesToInsert = categoriesData.map((c) => ({
      name: c.name,
      slug: createSlug(c.name),
      image: c.image,
      isActive: true,
      createdBy: adminId,
    }));
    const createdCategories = await Category.insertMany(categoriesToInsert);

    // 4) SubCategories (كل واحدة تشير للـ category._id)
    console.log("🌿 Creating subcategories...");
    const subCategoriesToInsert = [];
    for (const cat of createdCategories) {
      const list = subCatsMap[cat.name] || [];
      for (const subName of list) {
        subCategoriesToInsert.push({
          name: subName,
          slug: createSlug(subName),
          category: cat._id,
          isActive: true,
          createdBy: adminId,
        });
      }
    }
    const createdSubCategories = await SubCategory.insertMany(
      subCategoriesToInsert
    );

    // 5) Brands (logo مطلوب، سنستخدم dummy image URL)
    console.log("🏷️ Creating brands...");
    const brandsToInsert = brandsData.map((b) => ({
      name: b.name,
      slug: createSlug(b.name),
      logo: `https://dummyimage.com/200x200/222/fff&text=${encodeURIComponent(
        b.name
      )}`,
      isActive: true,
      createdBy: adminId,
    }));
    const createdBrands = await Brand.insertMany(brandsToInsert);

    // 6) Create products (نضمن أن الحقول المطلوبة بالموديل متوفرة)
    console.log("📦 Creating products...");
    const productsToInsert = [];
    // نولّد 120 منتج تقريباً مع روابط صحيحة للفئات والسبكات والبراند (إلزامي: category & subCategory)
    for (let i = 0; i < 120; i++) {
      const sub =
        createdSubCategories[
          Math.floor(Math.random() * createdSubCategories.length)
        ];
      // إيجاد الـ parent category للمرة الآمنة:
      const parentCat = createdCategories.find((c) =>
        c._id.equals(sub.category)
      );

      // اختيار براند اذا وُجد matching brand by category name، وإلا أخذ براند عشوائي
      const filteredBrands = createdBrands.filter((b) => {
        const bd = brandsData.find((x) => x.name === b.name);
        return bd && bd.cat === parentCat.name;
      });
      const chosenBrand =
        filteredBrands.length > 0
          ? filteredBrands[Math.floor(Math.random() * filteredBrands.length)]
          : createdBrands[Math.floor(Math.random() * createdBrands.length)];

      const adj =
        productAdjectives[
          Math.floor(Math.random() * productAdjectives.length)
        ];
      const uniqueSuffix = `${Date.now().toString().slice(-5)}${i}`;

      const productName = `${chosenBrand.name} ${sub.name} ${adj} ${uniqueSuffix}`;

      const stock = Math.floor(Math.random() * 100);
      const price =
        parentCat.name === "Electronics"
          ? Math.floor(Math.random() * 1200) + 150
          : Math.floor(Math.random() * 200) + 20;

      // images: ensure non-empty array (schema validate)
      const images = [
        `https://loremflickr.com/800/800/${encodeURIComponent(
          sub.name.replace(/\s/g, "")
        )}?lock=${uniqueSuffix}`,
        `https://loremflickr.com/800/800/product?lock=${uniqueSuffix}`,
      ];

      productsToInsert.push({
        name: productName,
        slug: createSlug(productName), // لأن insertMany يتخطى pre('save')
        price,
        description: `High quality ${productName}`,
        stock,
        images,
        size: null,
        discount: 0,
        ratingsAverage: Number((Math.random() * (5 - 3.8) + 3.8).toFixed(1)),
        ratingsQuantity: Math.floor(Math.random() * 200),
        isAvailable: stock > 0,
        category: parentCat._id,
        subCategory: sub._id,
        brand: chosenBrand._id,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const createdProducts = await Product.insertMany(productsToInsert);

    // 7) Dummy users (نستخدم create لتفعيل pre('save') -> تشفير)
    console.log("👥 Creating dummy users...");
    const dummyUsers = await Promise.all([
      User.create({
        name: "Ahmed",
        email: `ahmed${Date.now()}@test.com`,
        password: "password123",
        passwordConfirm: "password123",
        role: "user",
      }),
      User.create({
        name: "Sara",
        email: `sara${Date.now() + 1}@test.com`,
        password: "password123",
        passwordConfirm: "password123",
        role: "user",
      }),
      // يمكن إضافة مزيد من المستخدمين هنا
    ]);

    // 8) Reviews: نضمن أن كل مراجعة لديها user مختلف عن product-user السابق (فهرس unique)
    console.log("⭐ Creating reviews...");
    const reviewDocs = [];
    for (let i = 0; i < createdProducts.length; i++) {
      const prod = createdProducts[i];
      // نختار مستخدم عشوائي لكن نضمن عدم تكرار نفس ثنائي product+user هنا (بس نحن ننشئ review واحد لكل منتج)
      const user = dummyUsers[i % dummyUsers.length];
      reviewDocs.push({
        review: "This product met expectations. Recommended.",
        rating: Math.floor(Math.random() * 2) + 4, // 4 أو 5
        product: prod._id,
        user: user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await Review.insertMany(reviewDocs);

    console.log("✅ Seeding finished successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

/* ===== CLI ===== */
if (process.argv[2] === "-d" || process.argv[2] === "--delete") {
  destroyData();
} else {
  importData();
}
