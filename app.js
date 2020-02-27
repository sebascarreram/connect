const fs = require('fs');
const express = require('express');

const app = express();

// for application/json
app.use(express.json());

// READ ALL TOURS
// JSON.parse() => it becomes a JavaScript object.
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// READ ALL USERS
// JSON.parse() => it becomes a JavaScript object.
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`)
);
//////
// GET ALL TOURS -> GET method
const getAllTours = (req, res) => {
  // status 200 is succeeded
  res.status(200).json({
    status: '200',
    results: tours.length,
    data: { tours }
  });
};
//////
// GET ALL USERS -> GET method
const getAllUsers = (req, res) => {
  // status 200 is succeeded
  res.status(200).json({
    status: '200',
    results: users.length,
    data: { users }
  });
};

//////
// GET TOUR BY ID -> GET method
const getTour = (req, res) => {
  // console.log(req.params); // To check or read http://expressjs.com/en/5x/api.html#req.params

  // To convert string to number
  const id = req.params.id * 1;

  // Array.prototype.find() is returns the value of the first element in the provided array or read https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
  const tour = tours.find(el => el.id === id);

  // If there isn't tour found or undefined so it's FALSE, to convert to TRUE because it's boolean
  if (!tour) {
    // status 404 is NOT FOUND
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  // status 200 is succeeded
  res.status(200).json({
    status: 'Success found',
    data: { tour }
  });
};

//////
// GET USER BY ID -> GET method
const getUser = (req, res) => {
  // console.log(req.params); // To check or read http://expressjs.com/en/5x/api.html#req.params

  // To convert string to number
  const id = req.params.id * 1;

  // Array.prototype.find() is returns the value of the first element in the provided array or read https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
  const user = users.find(el => el.id === id);

  // If there isn't tour found or undefined so it's FALSE, to convert to TRUE because it's boolean
  if (!user) {
    // status 404 is NOT FOUND
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  // status 200 is succeeded
  res.status(200).json({
    status: 'Success found',
    data: { user }
  });
};

//////
// Create a tour -> POST method
const createTour = (req, res) => {
  // console.log(req.body);

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);
  // fs.writeFile(file, data[, options], callback)
  // ---
  // file is a filename where save to filename e.g. users.json
  // data is a file descriptor which is a data for save to filename
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      // status 201 is created success
      res.status(201).json({
        status: 'Success',
        data: {
          tour: newTour
        }
      });
    }
  );
};

//////
// Create a user -> POST method
const createUser = (req, res) => {
  // console.log(req.body); // Check it

  const newId = users[users.length - 1].id + 1;
  const newUser = Object.assign({ id: newId }, req.body);

  users.push(newUser);
  // fs.writeFile(file, data[, options], callback)
  // ---
  // file is a filename where save to filename e.g. users.json
  // data is a file descriptor which is a data for save to filename
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    err => {
      // status 201 is created success
      res.status(201).json({
        status: 'Success',
        data: {
          user: newUser
        }
      });
    }
  );
};

//////
// Update a tour by id -> PATCH method
const udpateTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    // status 404 is NOT FOUND
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  // status 200 is success
  res.status(200).json({
    status: 'Success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

//////
// Update a user by id -> PATCH method
const updateUser = (req, res) => {
  if (req.params.id * 1 > users.length) {
    // status 404 is NOT FOUND
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  // status 200 is success
  res.status(200).json({
    status: 'Success',
    data: {
      user: '<Updated user here...>'
    }
  });
};

//////
// Delete a tour by id -> DELETE method
const deleteTour = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    // status 404 is NOT FOUND
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  // status 204 is NO CONTENT to send for this request, but the headers may be useful.
  res.status(204).json({
    status: 'Deleted success',
    data: null
  });
};

//////
// Delete a user by id -> DELETE method
const deleteUser = (req, res) => {
  if (req.params.id * 1 > users.length) {
    // status 404 is NOT FOUND
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID'
    });
  }

  // status 204 is NO CONTENT to send for this request, but the headers may be useful.
  res.status(204).json({
    status: 'Deleted success',
    data: null
  });
};

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

//////////////
/////// Tours
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(udpateTour)
  .delete(deleteTour);

//////////////
/////// Users
app
  .route('/api/v1/users')
  .get(getAllUsers)
  .post(createUser);

app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
const port = 3000;
// For connections on the specified host and port.
// http://127.0.0.1:3000
app.listen(port, () => {
  console.log(`App running on port ${port}...💥`);
});
