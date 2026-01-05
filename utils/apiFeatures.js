class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    const parsedQuery = {};

    for (const key in queryObj) {
      const value = queryObj[key];

      // معالجة الفلاتر المركبة مثل price[gte], ratingsAverage[gt]
      if (key.includes('[') && key.includes(']')) {
        const [field, operator] = key.split(/[\[\]]/);
        if (!parsedQuery[field]) parsedQuery[field] = {};
        parsedQuery[field]['$' + operator] = isNaN(value) ? value : Number(value);
      } else {
        // دعم البحث الجزئي للنصوص
        if (typeof value === 'string' && isNaN(value)) {
          // دعم فلترة متعددة القيم tags=electronics,books
          if (value.includes(',')) {
            const values = value.split(',').map(v => v.trim());
            parsedQuery[key] = { $in: values };
          } else {
            parsedQuery[key] = { $regex: value, $options: 'i' }; // بحث جزئي غير حساس لحالة الأحرف
          }
        } else {
          parsedQuery[key] = isNaN(value) ? value : Number(value);
        }
      }
    }

    console.log('MongoDB Query:', parsedQuery);
    this.query = this.query.find(parsedQuery);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
      console.log('Sort:', sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
      console.log('Sort: -createdAt (default)');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      console.log('Selected Fields:', fields);
    } else {
      this.query = this.query.select('-__v');
      console.log('Selected Fields: -__v (default)');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    console.log(`Pagination: page ${page}, limit ${limit}, skip ${skip}`);
    return this;
  }
}

export default APIFeatures;
