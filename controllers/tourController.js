/* eslint-disable */
// const fs = require('fs');

const Tour = require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// READ ALL TOURS
// JSON.parse() => it becomes a JavaScript object.
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   // if (req.params.id * 1 > tours.length || req.params.id !== undefined) {
//   if (req.params.id * 1 > tours.length) {
//     // status 404 is NOT FOUND
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

// Check if name or price is missing, send error when is missing
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Required name or price'
//     });≈
//   }
//   next();
// };

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// class APIFeatures {
//   constructor(query, queryString) {
//     this.query = query;
//     this.queryString = queryString;
//   }

//   filter() {
//     // 1-A) FILTERING
//     const queryObj = { ...this.queryString };
//     const exludedFields = ['page', 'sort', 'limit', 'fields'];
//     exludedFields.forEach(el => delete queryObj[el]);

//     // Output -> Query params

//     // console.log(req.query, queryObj);
//     ////////////////////////////////////////////////////////////////
//     ////////////////////////////////////////////////////////////////
//     // 2-B) ADVANCED FILTERING

//     let queryStr = JSON.stringify(queryObj);
//     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
//     // console.log(' ');
//     // console.log(JSON.stringify(queryObj), 'STRINGIFY');
//     // console.log(' ');
//     // console.log(JSON.parse(queryStr), 'PARSE');
//     // console.log(' ');
//     // find() -> it's a method mongoDB
//     // const tours = await Tour.find(req.query);
//     // const tours = await Tour.find(queryObj);
//     // const query = Tour.find(queryObj);

//     // let query = Tour.find(JSON.parse(queryStr));
//     this.query = this.query.find(JSON.parse(queryStr));

//     return this;
//   }

//   sort() {
//     if (this.queryString.sort) {
//       const sortBy = this.queryString.sort.split(',').join(' ');
//       // console.log(sortBy);
//       // query = query.sort(sortBy);
//       this.query = this.query.sort(sortBy);
//       // query.sort('price ratingsAverage')
//     } else {
//       this.query = this.query.sort('-createdAt');
//       // query = query.sort('-createdAt');
//     }
//     return this;
//   }

//   limitFields() {
//     if (this.queryString.fields) {
//       const fields = this.queryString.fields.split(',').join(' ');
//       // query = query.select('name duration price');
//       this.query = this.query.select(fields);
//     } else {
//       this.query = this.query.select('-__v');
//     }
//     return this;
//   }
//   paginate() {
//     const page = this.queryString.page * 1 || 1;
//     const limit = this.queryString.limit * 1 || 100;
//     const skip = (page - 1) * limit;

//     this.query = this.query.skip(skip).limit(limit);

//     return this;
//   }
// }

//////
// GET ALL TOURS -> GET method
exports.getAllTours = catchAsync(async (req, res, next) => {
  //   console.log(req.requestTime);
  // status 200 is succeeded

  // console.log(req.query);

  ////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours }
  });
});

//////
// GET TOUR BY ID -> GET method
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(
      new AppError(`No tour found with that ID ${req.params.id}`, 404)
    );
  }

  // status 200 is succeeded
  res.status(200).json({
    status: 'Success',
    data: { tour }
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'Created tour successfully',
    data: {
      tour: newTour
    }
  });
});

//////
// Update a tour by id -> PATCH method
exports.udpateTour = catchAsync(async (req, res, next) => {
  // if (req.params.id * 1 > tours.length) {
  //   // status 404 is NOT FOUND
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID'
  //   });
  // }

  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    return next(
      new AppError(`No tour found with that ID ${req.params.id}`, 404)
    );
  }

  // status 200 is success
  res.status(200).json({
    status: 'Success',
    data: {
      tour
    }
  });
});

//////
// Delete a tour by id -> DELETE method
exports.deleteTour = catchAsync(async (req, res, next) => {
  // if (req.params.id * 1 > tours.length) {
  //   // status 404 is NOT FOUND
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID'
  //   });
  // }

  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(
      new AppError(`No tour found with that ID ${req.params.id}`, 404)
    );
  }

  // status 204 is NO CONTENT to send for this request, but the headers may be useful.
  res.status(204).json({
    status: 'Deleted success',
    data: null
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        // _id: null,
        // _id: '$difficulty',
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numTours: { $sum: 1 },
        sumRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  // status 200 is success
  res.status(200).json({
    status: 'Success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      // $sort: { month: 1 }
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 6
      // $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan }
  });
});
