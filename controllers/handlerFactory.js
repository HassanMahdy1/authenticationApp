import AppError from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";
import filterObj from "../utils/whiteListingFilterObjBody.js";

export const deleteOne = (Model) => async (req, res, next) => {
  try {
    // التحقق من صحة الـ ID
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid ID format", 400));
    }

    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
export const updateOne = (Model, allowedFields) => async (req, res, next) => {
  try {
    // التحقق من صحة الـ ID
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid ID format", 400));
    }

    const filteredBody = filterObj(req.body, ...allowedFields);
    if (Object.keys(filteredBody).length === 0) {
      return next(new AppError("No valid fields to update", 400));
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const createOne = (Model, allowedFields) => async (req, res, next) => {
  try {
    const filteredBody = filterObj(req.body, ...allowedFields);
    if (req.user) {filteredBody.createdBy = req.user.id;}
    if (Object.keys(filteredBody).length === 0) {
      return next(new AppError("No valid fields to create", 400));
    }

    const doc = await Model.create(filteredBody);

    res.status(201).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const getOne = (Model, popOptions) => async (req, res, next) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(new AppError("Invalid ID format", 400));
    }

    let query = Model.findById(req.params.id);

    if (popOptions) {
      query = query.populate(popOptions);
    }

    const doc = await query.exec(); // ← الحل هنا

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};



export const getAll = (Model) => async (req, res, next) => {
  try {
    // دعم فلترة Nested (اختياري)
    let filter = {};
    if (req.params.categoryId) {filter = { category: req.params.categoryId };}

    // جلب معايير الصفحة من queryString
    const page = Math.max(1, req.query.page * 1 || 1);
    const limit = Math.max(1, Math.min(100, req.query.limit * 1 || 100));

    // إنشاء الاستعلام مع APIFeatures
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // جلب النتائج للصفحة الحالية
    const docs = await features.query;

    // حساب العدد الإجمالي للنتائج بعد تطبيق الفلاتر من APIFeatures
    const filteredQuery = { ...filter };
    // إذا كان هناك فلاتر من APIFeatures، نحتاج لحسابها
    const totalResults = await Model.countDocuments(filter);

    // حساب إجمالي الصفحات
    const totalPages = Math.ceil(totalResults / limit);

    // إرسال الاستجابة
    res.status(200).json({
      status: "success",
      results: docs.length, // عدد العناصر في الصفحة الحالية
      page, // الصفحة الحالية
      totalPages, // عدد الصفحات الكلي
      totalResults, // العدد الكلي للمنتجات المطابقة للفلاتر
      data: {
        data: docs,
      },
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
