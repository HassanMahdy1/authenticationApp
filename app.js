import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cors from "cors"; // إضافة ضرورية
import compression from "compression"; // لتحسين الأداء
import rootRoutes from "./routes/rootRouter.js";
import globalErrorHandler from "./controllers/errorController.js";
import AppError from "./utils/appError.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(morgan('dev'));
// 1. CORS - التحكم في الوصول للمصادر (أساسي لأي API)
app.use(
  cors({
    origin: process.env.CLIENT_URL , //يتم مسح النجمه في حاله رفع البروداكشن
    credentials: true,
    
  })
);

// 2. Security Headers (تحديث خيارات Helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// 3. Logging
if (process.env.NODE_ENV ) {
  app.use(morgan("dev"));
}

// 4. Rate Limiting (باستخدام الإعدادات الحديثة)
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // تقليل الوقت لـ 15 دقيقة
  standardHeaders: "draft-7", // معيار 2025 للحماية
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api", limiter);

// 5. Body Parsers (تقليل الحجم وتحسين الأداء)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 7. Parameter Pollution
app.use(
  hpp({
    whitelist: ["price", "ratingsAverage", "ratingsQuantity", "category"],
  })
);

// 8. Performance (ضغط البيانات المرسلة)
app.use(compression());
app.use(cookieParser());

/* ===============================
    ROUTES
================================ */

app.use("/api/v1", rootRoutes);

app.use(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use((req, res, next) => {
  console.log("Cookies:", req.cookies);
  next();
});

app.use(globalErrorHandler);

export default app;

// import mongoSanitize from 'express-mongo-sanitize';
