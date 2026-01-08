import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import rootRoutes from "./routes/rootRouter.js";
import globalErrorHandler from "./controllers/errorController.js";
import AppError from "./utils/appError.js";

const app = express();

/* ===============================
   1. Security Headers
================================ */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/* ===============================
   2. CORS
================================ */
app.use(
  cors({
    origin: process.env.CLIENT_URL, // ضع URL الواجهة الأمامية هنا
    credentials: true,
  })
);

/* ===============================
   3. Logging
================================ */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* ===============================
   4. Rate Limiting
================================ */
const limiter = rateLimit({
  max: 100,
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
});
app.use("/api", limiter);

/* ===============================
   5. Body Parsers
================================ */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/* ===============================
   6. Cookie Parser
================================ */
app.use(cookieParser());

// اختياري: عرض الكوكيز لل debug
app.use((req, res, next) => {
  console.log("Cookies:", req.cookies);
  next();
});

/* ===============================
   7. NoSQL & XSS Sanitization
      بدون express-mongo-sanitize
================================ */
function sanitize(req, res, next) {
  const sanitizeObject = obj => {
    for (let key in obj) {
      if (/^\$/.test(key) || /\./.test(key)) {
        obj[key.replace(/^\$/,'_').replace(/\./,'_')] = obj[key];
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
}

app.use(sanitize);

/* ===============================
   8. Parameter Pollution Protection
================================ */
app.use(
  hpp({
    whitelist: ["price", "ratingsAverage", "ratingsQuantity", "category"],
  })
);

/* ===============================
   9. Performance Optimization
================================ */
app.use(compression());

/* ===============================
   10. Routes
================================ */
app.use("/api/v1", rootRoutes);

/* ===============================
   11. Handle Undefined Routes
================================ */
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

/* ===============================
   12. Global Error Handler
================================ */
app.use(globalErrorHandler);

export default app;
