/* eslint-disable */

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1-A) FILTERING
    const queryObj = { ...this.queryString };
    const exludedFields = ['page', 'sort', 'limit', 'fields'];
    exludedFields.forEach(el => delete queryObj[el]);

    // Output -> Query params

    // console.log(req.query, queryObj);
    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    // 2-B) ADVANCED FILTERING

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log(' ');
    // console.log(JSON.stringify(queryObj), 'STRINGIFY');
    // console.log(' ');
    // console.log(JSON.parse(queryStr), 'PARSE');
    // console.log(' ');
    // find() -> it's a method mongoDB
    // const tours = await Tour.find(req.query);
    // const tours = await Tour.find(queryObj);
    // const query = Tour.find(queryObj);

    // let query = Tour.find(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sortBy);
      // query = query.sort(sortBy);
      this.query = this.query.sort(sortBy);
      // query.sort('price ratingsAverage')
    } else {
      this.query = this.query.sort('-createdAt');
      // query = query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      // query = query.select('name duration price');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
