const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
// 1) MIDDLEWARE
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
//
// for application/json
app.use(express.json());

app.use(express.static(`${__dirname}/public`));

// Test, how to works 'next()'
app.use((req, res, next) => {
  console.log('Hello from middleware ♥️');
  // next() => Next middleware after execut here, not problem BUT if there's error or missing something.
  // It should to be a 'return'  with or without callback
  next();
});

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

module.exports = app;
