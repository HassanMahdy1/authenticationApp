class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    const parsedQuery = {};

    for (const key in queryObj) {
      const value = queryObj[key];

      // معالجة الفلاتر المركبة مثل price[gte], ratingsAverage[gt]
      if (key.includes("[") && key.includes("]")) {
        const [field, operator] = key.split(/[\[\]]/);
        // التحقق من أن المعامل صحيح
        const validOperators = ["gte", "gt", "lte", "lt", "eq", "ne"];
        if (!validOperators.includes(operator)) {
          continue; // تخطي المعاملات غير الصحيحة
        }
        if (!parsedQuery[field]) parsedQuery[field] = {};
        parsedQuery[field]["$" + operator] = isNaN(value)
          ? value
          : Number(value);
      } else {
        // دعم البحث الجزئي للنصوص
        if (typeof value === "string" && isNaN(value)) {
          // دعم فلترة متعددة القيم tags=electronics,books
          if (value.includes(",")) {
            const values = value.split(",").map((v) => v.trim());
            parsedQuery[key] = { $in: values };
          } else {
            // التحقق من الـ regex لتجنب الأخطاء
            try {
              parsedQuery[key] = { $regex: value, $options: "i" }; // بحث جزئي غير حساس لحالة الأحرف
            } catch {
              parsedQuery[key] = value; // في حالة الخطأ، استخدم القيمة مباشرة
            }
          }
        } else {
          parsedQuery[key] = isNaN(value) ? value : Number(value);
        }
      }
    }

    this.query = this.query.find(parsedQuery);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = Math.max(1, this.queryString.page * 1 || 1); // التأكد من أن الصفحة >= 1
    const limit = Math.max(1, Math.min(100, this.queryString.limit * 1 || 100)); // تحديد الحد الأقصى للـ limit
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;
