// const fs = require('fs');

const Tour = require('../models/tourModel');

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

//////
// GET ALL TOURS -> GET method
exports.getAllTours = async (req, res) => {
  //   console.log(req.requestTime);
  // status 200 is succeeded

  try {
    console.log(req.query);
    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    // BUILD QUERY
    // 1-A) FILTERING
    const queryObj = { ...req.query };
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
    let query = Tour.find(JSON.parse(queryStr));

    // { difficulty: 'easy', duration: { $gte: 5 } }
    // { difficulty: 'easy', duration: { '$gte': '5' }, }

    // const tours = await Tour.find({
    //   duration: req.query.duration,
    //   difficulty: req.query.difficulty
    // });
    // const query =  Tour.find({
    //   duration: req.query.duration,
    //   difficulty: req.query.difficulty
    // });
    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    // 3) SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      // console.log(sortBy);
      query = query.sort(sortBy);
      // query.sort('price ratingsAverage')
    } else {
      query = query.sort('-createdAt');
    }
    // console.log(req.query.fields); // --> expected output: name,duration,difficulty,price
    // console.log(req.query.fields.split(',')); // --> expected output: [ 'name', 'duration', 'difficulty', 'price' ]
    // console.log(req.query.fields.split(',').join(' ')); // --> expected output: name duration difficulty price
    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    // 3) FIELD LIMITING
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      // query = query.select('name duration price');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    // 3) PAGINATION
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // console.log(skip, 'SKIP');
    query = query.skip(skip).limit(limit);
    // console.log(req.query.page * 1, req.query.limit * 1);
    // console.log(page, limit);
    //
    // page=2&limit=10
    // query = query.skip(2).limit(10);
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    ////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////
    // EXECUTE QUERY
    // const features = new APIFeatures(Tour.find(), req.query).filter();
    const tours = await query;
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(req.query.duration)
    //   .where('difficulty')
    //   .equals(req.query.difficulty);
    //
    // After finished, all can together example:
    // query.sort().select().skip().limit();

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: { tours }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

//////
// GET TOUR BY ID -> GET method
exports.getTour = async (req, res) => {
  // console.log(req.params); // To check or read http://expressjs.com/en/5x/api.html#req.params

  // To convert string to number
  // const id = req.params.id * 1;

  // // Array.prototype.find() is returns the value of the first element in the provided array or read https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
  // const tour = tours.find(el => el.id === id);

  //////
  // If there isn't tour found or undefined so it's FALSE, to convert to TRUE because it's boolean
  // if (!tour) {
  //   // status 404 is NOT FOUND
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID'
  //   });
  // }

  try {
    const tour = await Tour.findById(req.params.id);

    // status 200 is succeeded
    res.status(200).json({
      status: 'Success found',
      data: { tour }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

//////
// Create a tour -> POST method
exports.createTour = async (req, res) => {
  // console.log(req.body);
  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  // tours.push(newTour);
  // // fs.writeFile(file, data[, options], callback)
  // // ---
  // // file is a filename where save to filename e.g. users.json
  // // data is a file descriptor which is a data for save to filename
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   () => {
  //     // status 201 is created success
  //     res.status(201).json({
  //       status: 'Success',
  //       data: {
  //         tour: newTour
  //       }
  //     });
  //   }
  // );

  try {
    // const newTour = new Tour({});
    // newTour.save();
    // It's a promise
    const newTour = await Tour.create(req.body);
    // .then()
    // .catch(() => {
    //   console.log('Create ERROR 😿, Try again');
    // });

    // status 201 is created success
    res.status(201).json({
      status: 'Created tour successfully',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed create',
      message: err.message // --> only development
      // message: 'Invalid data sent!' --> only production
    });
  }
};

//////
// Update a tour by id -> PATCH method
exports.udpateTour = async (req, res) => {
  // if (req.params.id * 1 > tours.length) {
  //   // status 404 is NOT FOUND
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID'
  //   });
  // }

  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // status 200 is success
    res.status(200).json({
      status: 'Success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err.message
    });
  }
};

//////
// Delete a tour by id -> DELETE method
exports.deleteTour = async (req, res) => {
  // if (req.params.id * 1 > tours.length) {
  //   // status 404 is NOT FOUND
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'Invalid ID'
  //   });
  // }

  try {
    await Tour.findByIdAndDelete(req.params.id);

    // status 204 is NO CONTENT to send for this request, but the headers may be useful.
    res.status(204).json({
      status: 'Deleted success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err.message
    });
  }
};
