const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// Set security HTTP headers
app.use(helmet());

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
// 1) GLOBAL MIDDLEWARE
//
// 'dev' -> Concise output colored by response status for development use.
// status >= 500 // red
// status >= 400 // yellow
// status >= 300 // cyan
// status >= 200 // green
// e.g:
// GET /api/v1/tours 200 5.674 ms - 8772 => 200 is color green in terminal
// GET /api/v1/tours/1s 404 0.808 ms - 40 => 404 is color yellow in terminal
// DELETE /api/v1/tours/103 404 0.408 ms - 40 => 404 is color yellow in terminal
// console.log(process.env.NODE_ENV);

// Only for development, NOT production
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // ⬆️
}

const limiter = rateLimit({
  // 100 requests from the same IP in 1 hour
  max: 100,
  // window Milliseconds
  // 1 hour
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body int req.body
// for application/json
// app.use(express.json());
app.use(express.json({ limit: '10kb' }));

// Data sanitization againist NoSQL query injection
app.use(mongoSanitize());

// Data sanitization againist XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers); // will show authorization and another more
  // console.log(x);
  next();
});

///////// Test, how to works 'next()'
/////
// app.use((req, res, next) => {
//   console.log('Hello from middleware ⬇️');
//   // next() => Next middleware after execut here, not problem BUT if there's error or missing something.
//   // It should to be a 'return'  with or without callback
//   next();
// });

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
// 2) ROUTE HANDLERS

// in controllers/tourController.js
// in controllers/userContoller.js

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
// There is two ways for routes and B) it's better because to save space and easier to read
//
// 3-A) ROUTES
//
// ////// GET ALL TOURS -> GET method
// // http://127.0.0.1:3000/api/v1/tours
// app.get('/api/v1/tours', getAllTours);

// ////// GET ALL USERS -> GET method
// // http://127.0.0.1:3000/api/v1/users
// app.get('/api/v1/users', getAllUsers);

// // GET TOUR BY ID -> GET method
// // http://127.0.0.1:3000/api/v1/tours/5
// // id is a variable => e.g: id = 5.
// app.get('/api/v1/tours/:id', getTour);

// // GET USER BY ID -> GET method
// // http://127.0.0.1:3000/api/v1/tours/5
// // id is a variable => e.g: id = 5.
// app.get('/api/v1/users/:id', getUser);

// // Create a tour -> POST method
// // http://127.0.0.1:3000/api/v1/tours
// app.post('/api/v1/tours', createTour);

// // Create a user -> POST method
// // http://127.0.0.1:3000/api/v1/users
// app.post('/api/v1/users', createUser);

// // Update a tour by id -> PATCH method
// // http://127.0.0.1:3000/api/v1/tours/3
// // id = 3, it's selected for update data
// app.patch('/api/v1/tours/:id', udpateTour);

// // Update a user by id -> PATCH method
// // http://127.0.0.1:3000/api/v1/users/3
// // id = 3, it's selected for update data
// app.patch('/api/v1/users/:id', updateUser);

// // Delete a tour by id -> DELETE method
// // http://127.0.0.1:3000/api/v1/tours/3
// // id = 3, it's selected for delete a data
// app.delete('/api/v1/tours/:id', deleteTour);

// // Delete a user by id -> DELETE method
// // http://127.0.0.1:3000/api/v1/users/3
// // id = 3, it's selected for delete a data
// app.delete('/api/v1/users/:id', deleteUser);

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
// 3-B) ROUTES
//
// in routes/tourRoutes.js
// in routes/userRoutes.js
//
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  ////// There is three(3) ways for response Error
  // 1)
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!!.`
  // });
  //
  // 2)
  // const err = new Error(`Can't find ${req.originalUrl} on this server!!.`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);
  //
  // 3)
  // AppError is a file called appError.js in 'utils' folder
  next(new AppError(`Can't find ${req.originalUrl} on this server!!.`, 404));
});

// GLOBAL ERROR
// app.use((err, req, res, next) => {
//   console.log(err.stack);

//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';

//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message
//   });
// });
app.use(globalErrorHandler);

module.exports = app;
