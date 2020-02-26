const fs = require('fs');
const express = require('express');

const app = express();

// for application/json
app.use(express.json());

// READ ALL TOURS
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

// READ ALL USERS
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/users.json`)
);

// GET ALL TOURS -> GET method
// http://127.0.0.1:3000/api/v1/tours
app.get('/api/v1/tours', (req, res) => {
  // status 200 is succeeded
  res.status(200).json({
    status: '200',
    results: tours.length,
    data: { tours }
  });
});

// GET ALL USERS -> GET method
// http://127.0.0.1:3000/api/v1/users
app.get('/api/v1/users', (req, res) => {
  // status 200 is succeeded
  res.status(200).json({
    status: '200',
    results: users.length,
    data: { users }
  });
});

// Create a tour -> POST method
// http://127.0.0.1:3000/api/v1/tours
app.post('/api/v1/tours', (req, res) => {
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
});

// Create a user -> POST method
// http://127.0.0.1:3000/api/v1/users
app.post('/api/v1/users', (req, res) => {
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
});

const port = 3000;
// For connections on the specified host and port.
// http://127.0.0.1:3000
app.listen(port, () => {
  console.log(`App running on port ${port}...💥`);
});
